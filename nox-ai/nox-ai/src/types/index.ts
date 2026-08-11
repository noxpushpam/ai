export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  isStreaming?: boolean;
}

export interface Attachment {
  id: string;
  type: "image" | "pdf" | "text";
  name: string;
  size?: number;
  url?: string; // data URL or blob URL
  preview?: string;
  extractedText?: string;
}

export type StudyToolType =
  | "summarizer"
  | "notes"
  | "questions"
  | "mcq"
  | "quiz"
  | "flashcards"
  | "answer"
  | "explain"
  | "planner"
  | "pdf-chat";

export interface StudyTool {
  id: StudyToolType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface HistoryItem {
  id: string;
  type: "chat" | "pdf" | "image" | "tool";
  title: string;
  preview: string;
  timestamp: number;
  tool?: StudyToolType;
}

export interface AIRequestPayload {
  messages: { role: string; content: string | any[] }[];
  model?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface TelegramNotificationPayload {
  sessionId: string;
  tool: string;
  question?: string;
  fileName?: string;
  details?: string;
  imageBase64?: string;
  error?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}
