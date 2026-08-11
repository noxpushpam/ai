import { NextRequest, NextResponse } from "next/server";
import {
  createChatCompletion,
  buildStudySystemPrompt,
} from "@/lib/ai/blackbox";
import { sendTelegramNotification } from "@/lib/telegram/notify";
import { z } from "zod";

// Simple in-memory rate limit (per IP)
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.union([
        z.string(),
        z.array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
            image_url: z
              .object({
                url: z.string(),
              })
              .optional(),
          })
        ),
      ]),
    })
  ),
  context: z.string().optional(),
  tool: z.string().optional(),
  sessionId: z.string().optional(),
  fileName: z.string().optional(),
  stream: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      sendTelegramNotification({
        sessionId: "rate-limit",
        tool: "Rate Limit",
        details: `IP ${ip} hit rate limit`,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { messages, context, tool, sessionId, fileName, stream } =
      parsed.data;

    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    const questionPreview =
      typeof lastUserMsg?.content === "string"
        ? lastUserMsg.content.slice(0, 400)
        : "[image or complex content]";

    sendTelegramNotification({
      sessionId: sessionId || "anonymous",
      tool: tool || "Chat",
      question: questionPreview,
      fileName,
      details: context ? "With study context" : undefined,
    }).catch(() => {});

    const systemPrompt = buildStudySystemPrompt(context);
    const finalMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content as any,
      })),
    ];

    if (stream) {
      const completion = await createChatCompletion({
        messages: finalMessages,
        stream: true,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion as any) {
              const content = chunk.choices?.[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err: any) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: err.message })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const completion = await createChatCompletion({
      messages: finalMessages,
      stream: false,
    });

    const content =
      (completion as any).choices?.[0]?.message?.content ||
      "No response generated.";

    return NextResponse.json({
      content,
      model: (completion as any).model,
      usage: (completion as any).usage,
    });
  } catch (error: any) {
    console.error("[/api/ai]", error);

    sendTelegramNotification({
      sessionId: "error",
      tool: "API Error",
      error: error?.message || "Unknown error",
    }).catch(() => {});

    const message =
      error?.message ||
      "AI service is temporarily unavailable. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
