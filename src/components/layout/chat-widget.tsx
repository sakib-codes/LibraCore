"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  User,
  X,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  suggestions?: string[];
}

const INITIAL_SUGGESTIONS = [
  "📚 Best books on Computer Science",
  "🎧 What audiobooks are available?",
  "🔍 Recommend books on Philosophy",
  "💡 How do I bookmark a resource?",
];

function cleanUrlAndLabel(rawLabel: string, rawUrl: string) {
  let url = rawUrl.trim();
  let label = rawLabel.trim();

  // Strip wrapping characters
  label = label.replace(/^[\(\[]+|[\)\]]+$/g, "").trim();
  url = url.replace(/^[<(\[]+|[>)\]]+$/g, "").trim();

  // Strip domains for internal relative paths
  url = url.replace(/^https?:\/\/[^/]+/i, "");
  if (!url.startsWith("/")) {
    url = "/" + url;
  }

  return { label, url };
}

function renderMessageContent(text: string) {
  // Regex to match markdown links [Title](url) and bold **text**
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*\n]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      const { label, url } = cleanUrlAndLabel(match[1], match[2]);
      const isInternalBook = url.startsWith("/books/");

      parts.push(
        <Link
          key={match.index}
          href={url}
          className={cn(
            "inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors mx-0.5",
            isInternalBook &&
              "rounded-md bg-primary/10 px-1.5 py-0.5 not-prose no-underline text-xs border border-primary/20 hover:bg-primary/20"
          )}
        >
          {isInternalBook && <BookOpen className="h-3 w-3 inline shrink-0" />}
          <span>{label}</span>
          <ArrowUpRight className="h-3 w-3 inline shrink-0 opacity-70" />
        </Link>
      );
    } else if (match[3]) {
      parts.push(
        <strong key={match.index} className="font-bold text-foreground">
          {match[3]}
        </strong>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function ChatWidget() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      text: "Hello! 👋 I am **LibrisAI**, your intelligent digital librarian.\n\nI can help you discover books, recommend study materials across categories, or analyze concepts. What would you like to explore today?",
      suggestions: INITIAL_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const formattedHistory = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));
      formattedHistory.push({ role: "user", text });

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedHistory,
          userContext: {
            userName: profile?.full_name || profile?.name || user?.email || "Reader",
            role: "user",
          },
        }),
      });

      const data = await res.json();
      const reply = data?.reply || "I apologize, but I could not synthesize a response.";
      const suggestions = data?.suggestions || [];

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: reply,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "A connection error occurred while querying the AI librarian. Please verify your connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        text: "Conversation reset. What topics or books would you like to look up?",
        suggestions: INITIAL_SUGGESTIONS,
      },
    ]);
  };

  return (
    <aside aria-label="LibrisAI Assistant" className="fixed bottom-3 right-3 z-50 sm:bottom-6 sm:right-6 max-w-[calc(100vw-1.5rem)]">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-white shadow-xl hover:shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Open LibrisAI Librarian"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask AI Librarian</span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="flex flex-col w-[min(calc(100vw-24px),400px)] h-[min(80vh,560px)] rounded-2xl border border-slate-200 bg-white dark:bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-indigo-700/40 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">LibrisAI Assistant (Gemini)</h3>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Gemini Flash 2.5 Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
                onClick={handleReset}
                title="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/70 dark:bg-muted/20">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "flex gap-2 max-w-[88%]",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-indigo-600 text-white"
                    )}
                  >
                    {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </div>

                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                        : "bg-white dark:bg-card text-foreground border border-slate-200 dark:border-border shadow-xs rounded-tl-none"
                    )}
                  >
                    {renderMessageContent(m.text)}
                  </div>
                </div>

                {/* Suggestions */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pl-8">
                    {m.suggestions.map((sugg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(sugg)}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-2xs"
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 pl-8 text-xs text-muted-foreground">
                <div className="google-thinking-spinner">
                  <span className="google-dot google-dot-1" />
                  <span className="google-dot google-dot-2" />
                  <span className="google-dot google-dot-3" />
                </div>
                <span>Librarian is pondering...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-border bg-white dark:bg-card flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
              placeholder="Ask for recommendations, concepts, links..."
              className="h-9 text-xs"
              disabled={loading}
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!input.trim() || loading}
              onClick={() => handleSend(input)}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
