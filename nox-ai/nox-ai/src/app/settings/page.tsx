"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Sparkles, Info, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="px-4 py-8 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Appearance</p>
            <p className="text-sm text-muted-foreground">
              Dark / Light mode
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <p className="font-medium">About Nox AI</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nox AI is your personal AI study assistant. Upload PDFs, images or
          capture questions with your camera. Get summaries, notes, MCQs,
          explanations and more.
        </p>
        <p className="text-sm text-muted-foreground">
          Created & Managed by <strong>Noxious</strong>
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <p className="font-medium">Privacy</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No mandatory registration. Session IDs are generated anonymously.
          API keys and Telegram credentials never leave the server. Local
          history stays on your device.
        </p>
      </div>

      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">Nox AI</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Version 1.0 · Powered by AI
        </p>
      </div>
    </div>
  );
}
