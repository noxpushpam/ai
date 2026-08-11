"use client";

import Link from "next/link";
import {
  Sparkles,
  Upload,
  Camera,
  MessageSquare,
  BookOpen,
  FileText,
  Brain,
  Zap,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "PDF Intelligence",
    desc: "Upload any PDF. Extract text, generate summaries, notes, MCQs and chapter-wise revision material.",
  },
  {
    icon: Camera,
    title: "Camera Question Solver",
    desc: "Snap a photo of any question — math, physics, chemistry or handwritten notes — and get step-by-step solutions.",
  },
  {
    icon: Brain,
    title: "Smart Study Tools",
    desc: "Summarizer, Notes Generator, MCQ & Quiz creator, Flashcards, Answer sheets and Study Planner.",
  },
  {
    icon: MessageSquare,
    title: "Context-Aware Chat",
    desc: "Chat with your notes. Ask follow-ups, regenerate answers, download results as PDF.",
  },
];

const howItWorks = [
  { step: "1", title: "Upload or Capture", desc: "PDF, image, screenshot or live camera" },
  { step: "2", title: "Nox AI Analyzes", desc: "OCR + understanding of the material" },
  { step: "3", title: "Get Results", desc: "Summaries, solutions, quizzes & more" },
];

const faqs = [
  {
    q: "Is Nox AI free to use?",
    a: "You can start studying immediately without registration. AI features require a configured Blackbox API key on the server.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. Nox AI is built mobile-first. Camera scanning, file uploads and PDF downloads work on Android and iPhone browsers.",
  },
  {
    q: "Can it solve handwritten questions?",
    a: "Yes. Clear handwritten math, physics and other subjects are supported via OCR + AI reasoning.",
  },
  {
    q: "Who created Nox AI?",
    a: "Nox AI is created and managed by Noxious.",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative px-4 pt-10 pb-16 md:pt-20 md:pb-24 max-w-6xl mx-auto">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            Powered by AI · Created by Noxious
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
            Nox AI
            <span className="block text-primary mt-1 text-3xl sm:text-4xl md:text-5xl font-semibold">
              Your Personal AI Study Assistant
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-8">
            Upload your notes, PDFs, images, or capture a question with your
            camera. Nox AI understands it and helps you learn.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Start Studying
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/study"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload PDF
            </Link>
            <Link
              href="/chat?camera=1"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary transition-colors"
            >
              <Camera className="h-4 w-4" />
              Scan Question
            </Link>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.2 }}
              className="rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 transition-colors"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 border-t border-border bg-card/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            How Nox AI Works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="text-center rounded-2xl border border-border bg-background p-6"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Why Nox AI
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Zap, title: "Fast & Focused", text: "Built for real study sessions, not endless chat." },
            { icon: Smartphone, title: "Mobile First", text: "Camera, uploads and PDF downloads work great on phones." },
            { icon: Shield, title: "Private by Design", text: "Anonymous sessions. No forced login. Keys stay on server." },
            { icon: BookOpen, title: "Complete Toolkit", text: "From summary to MCQ to flashcards in one place." },
            { icon: CheckCircle2, title: "Exam Ready", text: "Generate important questions and revision material quickly." },
            { icon: Sparkles, title: "Premium Feel", text: "Clean dark interface designed for long study hours." },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-xl border border-border p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 border-t border-border bg-card/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            FAQ
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-border bg-background p-5"
              >
                <h3 className="font-medium mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">Nox AI</span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          AI Study Assistant
        </p>
        <p className="text-xs text-muted-foreground">
          Owner: Noxious · Created & Managed by Noxious
        </p>
      </footer>
    </div>
  );
}
