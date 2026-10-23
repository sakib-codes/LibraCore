"use client";

import { useState } from "react";
import { Sparkles, Send, Bot, User, RotateCcw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface BookAiPanelProps {
  bookTitle: string;
  author: string;
  category?: string;
  description?: string;
  trigger?: React.ReactNode;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const PRESET_QUESTIONS = [
  "What are the central themes of this book?",
  "Summarize key arguments in 3 bullet points",
  "What historical context influenced this work?",
  "Who will benefit most from reading this?",
];

export function BookAiPanel({
  bookTitle,
  author,
  category,
  description,
  trigger,
}: BookAiPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      text: `Greetings! I am ready to explore **"${bookTitle}"** by ${author} with you. Ask me anything regarding its arguments, concepts, or themes.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend: string) => {
    const q = textToSend.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "book-qa",
          bookTitle,
          author,
          category,
          description,
          question: q,
        }),
      });

      const data = await res.json();
      const replyText =
        data?.result || "I apologize, but I could not analyze that question at this moment.";

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: replyText,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "A connection error occurred while querying the AI librarian. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="default" className="w-full sm:w-auto justify-center gap-2 shadow-md bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold">
            <Sparkles className="h-4 w-4" /> Ask AI About This Book
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background">
        {/* Header */}
        <SheetHeader className="p-4 sm:p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Ask AI About This Book
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground line-clamp-1">
                Contextual analysis for {bookTitle}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Preset Question Pills */}
        <div className="px-4 py-2.5 border-b border-border/50 bg-background/50 flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(pq)}
              className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <ScrollArea className="flex-1 p-4 space-y-4">
          <div className="space-y-3.5 pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-2.5 text-sm",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-xl px-3.5 py-2.5 max-w-[85%] leading-relaxed text-xs sm:text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                      : "bg-muted text-foreground rounded-tl-none border border-border"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                {m.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground pl-1">
                <div className="google-thinking-spinner">
                  <span className="google-dot google-dot-1" />
                  <span className="google-dot google-dot-2" />
                  <span className="google-dot google-dot-3" />
                </div>
                <span>Gemini is analyzing the text...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-border bg-background flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder={`Ask a question about ${bookTitle}...`}
            className="text-xs sm:text-sm h-10"
            disabled={loading}
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={!input.trim() || loading}
            onClick={() => sendMessage(input)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
