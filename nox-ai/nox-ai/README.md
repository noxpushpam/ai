# Nox AI — AI Study Assistant

**Your Personal AI Study Assistant**  
Created & Managed by **Noxious**

Nox AI is a modern, mobile-first AI study platform. Upload PDFs and images, scan questions with your camera, chat with context-aware AI, generate notes, MCQs, flashcards, quizzes and download professional PDF results.

## Features

- **AI Chat** — Context-aware study assistant with streaming responses
- **PDF Support** — Upload and analyze PDFs
- **Camera Scanner** — Capture questions on mobile browsers
- **Image Question Solver** — Math, physics, handwritten notes, diagrams
- **Study Tools** — Summarizer, Notes, MCQ, Quiz, Flashcards, Planner, etc.
- **PDF Result Export** — Download answers as branded A4 PDFs
- **Telegram Notifications** — Secure owner alerts (server-side only)
- **Dark / Light Mode**
- **PWA-ready**
- **Mobile-first** responsive UI with bottom navigation

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Blackbox AI (OpenAI-compatible API)
- jsPDF, KaTeX, react-markdown, Framer Motion, Lucide icons

## Quick Start

### 1. Clone & Install

```bash
cd nox-ai
npm install
```

### 2. Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
BLACKBOX_API_KEY=your_blackbox_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_OWNER_CHAT_ID=your_telegram_chat_id_here
```

#### Getting a Blackbox API Key
1. Go to https://app.blackbox.ai or https://docs.blackbox.ai
2. Create an API key
3. Paste it into BLACKBOX_API_KEY

#### Telegram Bot Setup
1. Message @BotFather on Telegram → /newbot
2. Copy the bot token → TELEGRAM_BOT_TOKEN
3. Message @userinfobot to get your chat ID → TELEGRAM_OWNER_CHAT_ID
4. Start a chat with your new bot so it can message you

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## Deployment on Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Add the same environment variables in the Vercel project settings:
   - BLACKBOX_API_KEY
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_OWNER_CHAT_ID
4. Deploy

**Important:** Never put secrets in NEXT_PUBLIC_* variables. All AI and Telegram calls are server-side only.

## Project Structure

```
src/
  app/
    page.tsx              # Landing page
    chat/page.tsx         # Main AI chat + camera + upload
    study/page.tsx        # Study tools dashboard
    files/page.tsx        # Local history
    settings/page.tsx
    api/
      ai/route.ts         # Secure Blackbox AI proxy
      telegram/route.ts   # Owner notifications
  components/
    layout/               # Shell, theme, sidebar, bottom nav
    camera/               # Mobile camera capture
    upload/               # Dropzone
  lib/
    ai/blackbox.ts        # Centralized AI client (server only)
    telegram/notify.ts    # Server-side Telegram
    pdf/generate-result-pdf.ts
    utils.ts
  types/
public/
  manifest.json
.env.example
```

## Security Notes

- BLACKBOX_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_OWNER_CHAT_ID exist only in server environment variables.
- Frontend never sees or calls Blackbox / Telegram directly.
- Rate limiting is applied on /api/ai.
- Anonymous session IDs only — no forced auth in v1.

## License

Private / Owner: Noxious

---

**Nox AI** · Powered by AI · Created by Noxious
