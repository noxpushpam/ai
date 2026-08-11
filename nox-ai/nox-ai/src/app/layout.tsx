import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nox AI — AI Study Assistant",
    template: "%s | Nox AI",
  },
  description:
    "Nox AI is your personal AI study assistant for PDFs, images, camera questions, notes, quizzes, summaries and intelligent study help.",
  keywords: [
    "AI study assistant",
    "PDF summarizer",
    "homework solver",
    "MCQ generator",
    "flashcards",
    "Nox AI",
    "study tools",
  ],
  authors: [{ name: "Noxious" }],
  creator: "Noxious",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Nox AI — AI Study Assistant",
    description:
      "Upload notes, PDFs or capture questions with your camera. Nox AI helps you learn faster.",
    siteName: "Nox AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nox AI — AI Study Assistant",
    description:
      "Your personal AI study assistant for PDFs, images and smart learning tools.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nox AI",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>{children}</AppShell>
          <Toaster
            position="top-center"
            theme="system"
            richColors
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
