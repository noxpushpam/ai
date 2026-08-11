"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Paperclip,
  Camera,
  Image as ImageIcon,
  FileText,
  Copy,
  RotateCcw,
  Download,
  Trash2,
  StopCircle,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn, generateSessionId } from "@/lib/utils";
import type { ChatMessage, Attachment } from "@/types";
import { CameraCapture } from "@/components/camera/camera-capture";
import { FileUploadZone } from "@/components/upload/file-upload-zone";
import { generateResultPdf } from "@/lib/pdf/generate-result-pdf";

export default function ChatPage() {
  const searchParams = useSearchParams();
  // Note: wrap parent in Suspense if needed for static generation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [contextText, setContextText] = useState("");
  const [sessionId] = useState(() => generateSessionId());
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get("camera") === "1") {
      setShowCamera(true);
    }
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if ((!text && attachments.length === 0) || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text || (attachments.length ? "[Attached material]" : ""),
      timestamp: Date.now(),
      attachments: attachments.length ? [...attachments] : undefined,
    };

    addMessage(userMsg);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    const assistantId = `a_${Date.now()}`;
    addMessage({
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    });

    try {
      // Build messages for API
      const apiMessages: any[] = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Current user content (support image)
      let userContent: any = text;
      const imageAtt = attachments.find((a) => a.type === "image" && a.url);
      if (imageAtt?.url) {
        userContent = [
          { type: "text", text: text || "Please solve or explain this." },
          {
            type: "image_url",
            image_url: { url: imageAtt.url },
          },
        ];
      }

      apiMessages.push({ role: "user", content: userContent });

      abortRef.current = new AbortController();

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          context: contextText || undefined,
          tool: imageAtt ? "Image / Camera" : "Chat",
          sessionId,
          fileName: attachments[0]?.name,
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.content) {
                full += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: full, isStreaming: true }
                      : m
                  )
                );
              }
            } catch {
              // ignore parse errors for partial
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: full, isStreaming: false } : m
        )
      );
    } catch (err: any) {
      if (err.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content || "Generation stopped.", isStreaming: false }
              : m
          )
        );
      } else {
        toast.error(err.message || "Something went wrong");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "Sorry, I couldn't process that. Please try again.",
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleRegenerate = (msgIndex: number) => {
    // Find previous user message
    const prevUser = messages
      .slice(0, msgIndex)
      .reverse()
      .find((m) => m.role === "user");
    if (prevUser) {
      setMessages((prev) => prev.slice(0, msgIndex));
      handleSend(prevUser.content);
    }
  };

  const handleDownloadPdf = async (content: string, question?: string) => {
    try {
      toast.loading("Generating PDF...");
      await generateResultPdf({
        question: question || "Study Session",
        answer: content,
        sessionId,
      });
      toast.dismiss();
      toast.success("PDF downloaded");
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const onFilesSelected = async (files: File[]) => {
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `att_${Date.now()}`,
              type: "image",
              name: file.name,
              size: file.size,
              url: reader.result as string,
              preview: reader.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        // For PDF we extract text client-side with pdfjs later or send name for now
        // Simplified: store as attachment and extract on send if needed
        setAttachments((prev) => [
          ...prev,
          {
            id: `att_${Date.now()}`,
            type: "pdf",
            name: file.name,
            size: file.size,
          },
        ]);
        toast.info("PDF attached. Text extraction will run when you ask.");
        // TODO: full PDF text extraction can be added with pdfjs-dist
      }
    }
    setShowUpload(false);
  };

  const onCameraCapture = (dataUrl: string) => {
    setAttachments([
      {
        id: `cam_${Date.now()}`,
        type: "image",
        name: "camera-capture.jpg",
        url: dataUrl,
        preview: dataUrl,
      },
    ]);
    setShowCamera(false);
    toast.success("Photo captured");
  };

  const clearChat = () => {
    setMessages([]);
    setContextText("");
    toast.success("Chat cleared");
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] lg:h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-semibold text-sm">Nox AI Assistant</h1>
            <p className="text-[11px] text-muted-foreground">
              Ask anything · Upload · Scan
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"
          title="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">How can I help you study?</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Type a question, upload a PDF or image, or scan a question with your camera.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Explain photosynthesis simply",
                "Generate 10 MCQs on Newton's laws",
                "Summarize this chapter",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-secondary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 animate-fade-in",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              )}
            >
              {msg.attachments?.map((att) =>
                att.preview ? (
                  <img
                    key={att.id}
                    src={att.preview}
                    alt={att.name}
                    className="max-h-48 rounded-lg mb-2 object-contain"
                  />
                ) : (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 text-xs opacity-80 mb-2"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {att.name}
                  </div>
                )
              )}

              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content || (msg.isStreaming ? "…" : "")}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}

              {msg.role === "assistant" && !msg.isStreaming && msg.content && (
                <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
                    title="Copy"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRegenerate(idx)}
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
                    title="Regenerate"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadPdf(
                        msg.content,
                        messages[idx - 1]?.content
                      )
                    }
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
                    title="Download PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Nox AI is thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative shrink-0 h-16 w-16 rounded-lg overflow-hidden border border-border"
            >
              {att.preview ? (
                <img
                  src={att.preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-secondary">
                  <FileText className="h-6 w-6" />
                </div>
              )}
              <button
                onClick={() =>
                  setAttachments((p) => p.filter((a) => a.id !== att.id))
                }
                className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/70 flex items-center justify-center"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border bg-card/60 px-3 py-3 safe-bottom">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <div className="flex gap-1">
            <button
              onClick={() => setShowCamera(true)}
              className="p-2.5 rounded-xl hover:bg-secondary text-muted-foreground"
              title="Scan with camera"
            >
              <Camera className="h-5 w-5" />
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-secondary text-muted-foreground"
              title="Upload image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-secondary text-muted-foreground"
              title="Upload PDF"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Nox AI anything…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
          />

          {isLoading ? (
            <button
              onClick={handleStop}
              className="p-3 rounded-xl bg-destructive/20 text-destructive"
            >
              <StopCircle className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() && attachments.length === 0}
              className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFilesSelected(files);
          e.target.value = "";
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFilesSelected(files);
          e.target.value = "";
        }}
      />

      {/* Camera modal */}
      {showCamera && (
        <CameraCapture
          onCapture={onCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
