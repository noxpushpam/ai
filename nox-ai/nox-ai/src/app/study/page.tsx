"use client";

import Link from "next/link";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Brain,
  Target,
  RefreshCw,
  PenTool,
  Lightbulb,
  Calendar,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

const tools = [
  {
    id: "summarizer",
    title: "Summarizer",
    description: "Upload material → generate concise summary",
    icon: FileText,
    color: "bg-blue-500/15 text-blue-400",
    href: "/chat?tool=summarizer",
  },
  {
    id: "notes",
    title: "Notes Generator",
    description: "Generate structured, exam-ready notes",
    icon: BookOpen,
    color: "bg-emerald-500/15 text-emerald-400",
    href: "/chat?tool=notes",
  },
  {
    id: "questions",
    title: "Question Generator",
    description: "Generate important exam questions",
    icon: HelpCircle,
    color: "bg-amber-500/15 text-amber-400",
    href: "/chat?tool=questions",
  },
  {
    id: "mcq",
    title: "MCQ Generator",
    description: "Multiple-choice questions with answers",
    icon: Brain,
    color: "bg-purple-500/15 text-purple-400",
    href: "/chat?tool=mcq",
  },
  {
    id: "quiz",
    title: "Quiz Generator",
    description: "Create interactive quizzes",
    icon: Target,
    color: "bg-rose-500/15 text-rose-400",
    href: "/chat?tool=quiz",
  },
  {
    id: "flashcards",
    title: "Flashcard Generator",
    description: "Create revision flashcards",
    icon: RefreshCw,
    color: "bg-cyan-500/15 text-cyan-400",
    href: "/chat?tool=flashcards",
  },
  {
    id: "answer",
    title: "Answer Generator",
    description: "Generate detailed answers",
    icon: PenTool,
    color: "bg-indigo-500/15 text-indigo-400",
    href: "/chat?tool=answer",
  },
  {
    id: "explain",
    title: "Explain Topic",
    description: "Explain difficult topics in simple language",
    icon: Lightbulb,
    color: "bg-yellow-500/15 text-yellow-400",
    href: "/chat?tool=explain",
  },
  {
    id: "planner",
    title: "Study Planner",
    description: "Create a study plan based on time & subjects",
    icon: Calendar,
    color: "bg-pink-500/15 text-pink-400",
    href: "/chat?tool=planner",
  },
  {
    id: "pdf-chat",
    title: "Ask From PDF",
    description: "Chat directly with uploaded PDF",
    icon: MessageSquare,
    color: "bg-orange-500/15 text-orange-400",
    href: "/chat?tool=pdf-chat",
  },
];

export default function StudyPage() {
  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Study Tools</h1>
        <p className="text-muted-foreground">
          Choose a tool and start learning with Nox AI
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 hover:bg-card transition-all"
          >
            <div
              className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tool.color}`}
            >
              <tool.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              {tool.title}
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
        <h2 className="font-semibold mb-2">Prefer free-form chat?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Open the AI Chat and ask anything, upload files, or scan questions.
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Open Nox AI Chat
        </Link>
      </div>
    </div>
  );
}
