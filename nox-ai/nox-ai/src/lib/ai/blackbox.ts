/**
 * Centralized Blackbox AI service.
 * All AI calls go through this module so endpoint / model can be changed easily.
 * NEVER import this in client components — only in API routes / server code.
 */

import OpenAI from "openai";

const BLACKBOX_BASE_URL =
  process.env.BLACKBOX_BASE_URL || "https://api.blackbox.ai";
const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY;
const DEFAULT_MODEL =
  process.env.BLACKBOX_MODEL || "blackboxai/openai/gpt-4o";

export function getBlackboxClient() {
  if (!BLACKBOX_API_KEY) {
    throw new Error(
      "BLACKBOX_API_KEY is not configured. Please set it in environment variables."
    );
  }

  return new OpenAI({
    apiKey: BLACKBOX_API_KEY,
    baseURL: BLACKBOX_BASE_URL,
  });
}

export interface ChatCompletionOptions {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export async function createChatCompletion(options: ChatCompletionOptions) {
  const client = getBlackboxClient();
  const {
    messages,
    model = DEFAULT_MODEL,
    temperature = 0.7,
    max_tokens = 4096,
    stream = false,
  } = options;

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream,
    });

    return response;
  } catch (error: any) {
    console.error("[Blackbox AI Error]", error?.message || error);

    if (error?.status === 401) {
      throw new Error("Invalid API key. Please check BLACKBOX_API_KEY.");
    }
    if (error?.status === 429) {
      throw new Error(
        "Rate limit exceeded. Please wait a moment and try again."
      );
    }
    if (error?.status === 503 || error?.code === "ECONNREFUSED") {
      throw new Error(
        "AI service is temporarily unavailable. Please try again later."
      );
    }
    if (error?.message?.includes("timeout")) {
      throw new Error("Request timed out. Please try again with a shorter input.");
    }

    throw new Error(
      error?.message ||
        "Unable to process your request with the AI service right now."
    );
  }
}

/**
 * Build a study-focused system prompt.
 */
export function buildStudySystemPrompt(context?: string): string {
  let prompt = `You are Nox AI, a premium personal AI study assistant created by Noxious.
Your goal is to help students learn effectively.

Guidelines:
- Be clear, structured, and educational.
- Use markdown for formatting (headings, lists, tables, code blocks).
- For mathematics and science, use LaTeX notation with $...$ or $$...$$.
- When solving problems, show step-by-step reasoning.
- Generate high-quality summaries, notes, MCQs, flashcards, and quizzes when asked.
- Keep answers focused on learning outcomes.
- If the user uploads notes or a PDF, base answers strictly on that material when possible.
- Never invent facts that contradict the provided study material.
- Be concise when possible, but thorough when explaining difficult topics.
- Support multiple languages if the user asks for translation.`;

  if (context) {
    prompt += `\n\n--- Study Material Context ---\n${context}\n--- End Context ---`;
  }

  return prompt;
}

/**
 * Helper for vision + text messages (images).
 */
export function buildVisionMessage(
  text: string,
  imageDataUrl: string
): OpenAI.Chat.ChatCompletionMessageParam {
  return {
    role: "user",
    content: [
      { type: "text", text },
      {
        type: "image_url",
        image_url: {
          url: imageDataUrl,
        },
      },
    ],
  };
}
