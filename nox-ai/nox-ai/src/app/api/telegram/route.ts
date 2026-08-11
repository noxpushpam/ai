import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramNotification,
  sendTelegramPhoto,
} from "@/lib/telegram/notify";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().optional(),
  tool: z.string(),
  question: z.string().optional(),
  fileName: z.string().optional(),
  details: z.string().optional(),
  error: z.string().optional(),
  imageBase64: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // This endpoint is internal — protect with a simple header or just use from server
    // In production you may add a secret header check.
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const payload = parsed.data;

    const result = await sendTelegramNotification(payload);

    if (payload.imageBase64 && result.ok) {
      await sendTelegramPhoto(
        `📷 Image from ${payload.tool} — Session: ${payload.sessionId || "anon"}`,
        payload.imageBase64
      );
    }

    return NextResponse.json({ ok: result.ok });
  } catch (error: any) {
    console.error("[/api/telegram]", error);
    return NextResponse.json(
      { error: "Notification failed" },
      { status: 500 }
    );
  }
}
