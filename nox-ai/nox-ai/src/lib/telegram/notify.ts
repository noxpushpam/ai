/**
 * Server-side only Telegram notification helper.
 * TELEGRAM_BOT_TOKEN and TELEGRAM_OWNER_CHAT_ID must never be exposed to the client.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_OWNER_CHAT_ID = process.env.TELEGRAM_OWNER_CHAT_ID;

export interface NotifyPayload {
  sessionId: string;
  tool: string;
  question?: string;
  fileName?: string;
  details?: string;
  error?: string;
  imageBase64?: string; // optional, without data: prefix if possible
}

function isConfigured(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_OWNER_CHAT_ID);
}

function buildMessage(payload: NotifyPayload): string {
  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  let msg = `━━━━━━━━━━━━━━━━━━━━
🚀 NOX AI NEW REQUEST
━━━━━━━━━━━━━━━━━━━━
👤 User:
${payload.sessionId || "Anonymous"}
🕐 Time:
${now}
🧰 Tool:
${payload.tool}`;

  if (payload.question) {
    msg += `\n❓ User Question:\n${payload.question.slice(0, 800)}`;
  }
  if (payload.fileName) {
    msg += `\n📄 File:\n${payload.fileName}`;
  }
  if (payload.details) {
    msg += `\n🤖 AI Request:\n${payload.details.slice(0, 500)}`;
  }
  if (payload.error) {
    msg += `\n⚠️ Error:\n${payload.error.slice(0, 300)}`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━
Nox AI
Owner: Noxious
━━━━━━━━━━━━━━━━━━━━`;

  return msg;
}

/**
 * Send a text notification to the owner.
 * Silently fails if not configured (so the app still works without Telegram).
 */
export async function sendTelegramNotification(
  payload: NotifyPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!isConfigured()) {
    return { ok: false, error: "Telegram not configured" };
  }

  try {
    const text = buildMessage(payload);

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_OWNER_CHAT_ID,
          text,
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Telegram] sendMessage failed:", errText);
      return { ok: false, error: "Failed to send Telegram message" };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[Telegram] Error:", err?.message);
    return { ok: false, error: err?.message || "Telegram error" };
  }
}

/**
 * Optionally send a photo (base64 or URL). Limited by Telegram size.
 */
export async function sendTelegramPhoto(
  caption: string,
  photoBase64: string
): Promise<{ ok: boolean }> {
  if (!isConfigured()) return { ok: false };

  try {
    // Telegram accepts multipart or file_id. For simplicity we use sendPhoto with URL if hosted,
    // but for base64 we convert to buffer and use FormData in Node.
    const form = new FormData();
    form.append("chat_id", TELEGRAM_OWNER_CHAT_ID!);
    form.append("caption", caption.slice(0, 1000));

    // Convert base64 to Blob
    const pureBase64 = photoBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(pureBase64, "base64");
    const blob = new Blob([buffer], { type: "image/jpeg" });
    form.append("photo", blob, "scan.jpg");

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: form,
      }
    );

    return { ok: res.ok };
  } catch (err) {
    console.error("[Telegram] Photo send error:", err);
    return { ok: false };
  }
}
