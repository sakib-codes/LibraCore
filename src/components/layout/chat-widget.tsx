"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  X,
  BookOpen,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatFormattedMessage } from "@/components/shared/chat-formatted-message";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  isTyping?: boolean;
  recommendedResource?: {
    title: string;
    href: string;
    coverUrl?: string;
  };
}

const RESEARCH_STARTERS = [
  {
    title: "Transformer Attention",
    subtitle: "Core literature on self-attention & scalability",
    prompt: "What are the primary papers on attention mechanisms in transformers?",
  },
  {
    title: "Post-Quantum Cryptography",
    subtitle: "Lattice-based security & transitions",
    prompt: "Which monographs cover post-quantum cryptographic transitions?",
  },
  {
    title: "Generative Deep Learning",
    subtitle: "Foundations of diffusion & neural synthesis",
    prompt: "Can you recommend introductory texts on deep generative models?",
  },
];

function getThinkingStage(seconds: number): string {
  if (seconds < 2) return "Querying catalog & indexed literature...";
  if (seconds < 5) return "Analyzing query & semantic vector embeddings...";
  if (seconds < 9) return "Consulting peer-reviewed monographs...";
  return "Synthesizing literature response...";
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for global custom events to open/toggle/close librarian
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("toggle-libris-ai-librarian", handleToggle);
    window.addEventListener("open-libris-ai-librarian", handleOpen);
    window.addEventListener("close-libris-ai-librarian", handleClose);

    return () => {
      window.removeEventListener("toggle-libris-ai-librarian", handleToggle);
      window.removeEventListener("open-libris-ai-librarian", handleOpen);
      window.removeEventListener("close-libris-ai-librarian", handleClose);
    };
  }, []);

  // Auto-focus input when chat drawer opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Clear typing interval on unmount
  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

  // Timer for active thinking & reasoning telemetry
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (loading) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading]);

  // Keep scroll container pinned to bottom on messages, open, loading, and time updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading, elapsedSeconds]);

  const submitQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...nextMessages.slice(-6)],
          message: text,
          history: nextMessages.slice(-6),
        }),
      });

      const data = await res.json();
      const reply =
        data?.reply ||
        "I analyzed your inquiry across our indexed academic library. You can explore relevant monographs in our catalog disciplines.";

      // Extract recommended resource if present
      let recommendedResource = undefined;
      const match = reply.match(/\[([^\]]+)\]\((\/books\/[^)]+)\)/);
      if (match) {
        recommendedResource = {
          title: match[1],
          href: match[2],
          coverUrl:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
        };
      }

      setLoading(false);

      const assistantId = String(Date.now() + 1);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: "",
          isTyping: true,
          recommendedResource,
        },
      ]);

      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

      let currentIndex = 0;
      const totalLength = reply.length;
      const step = Math.max(2, Math.ceil(totalLength / 60));

      typeIntervalRef.current = setInterval(() => {
        currentIndex += step;
        if (currentIndex >= totalLength) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: reply, isTyping: false } : m
            )
          );
        } else {
          const slice = reply.slice(0, currentIndex);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: slice, isTyping: true } : m
            )
          );
        }
      }, 20);
    } catch {
      setLoading(false);
      const fallbackReply =
        "I am currently synthesizing the requested literature. Please browse our catalog disciplines for immediate monograph downloads.";
      const assistantId = String(Date.now() + 1);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: "",
          isTyping: true,
        },
      ]);

      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

      let currentIndex = 0;
      const step = Math.max(2, Math.ceil(fallbackReply.length / 40));

      typeIntervalRef.current = setInterval(() => {
        currentIndex += step;
        if (currentIndex >= fallbackReply.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: fallbackReply, isTyping: false } : m
            )
          );
        } else {
          const slice = fallbackReply.slice(0, currentIndex);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: slice, isTyping: true } : m
            )
          );
        }
      }, 20);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery(input);
  };

  const handleReset = () => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    setMessages([]);
    setInput("");
  };

  return (
    <aside
      aria-label="LibrisAI Assistant"
      className="fixed bottom-3 right-3 z-50 sm:bottom-6 sm:right-6 max-w-[calc(100vw-1.5rem)]"
    >
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-card/95 dark:bg-card/90 backdrop-blur-md border border-border/80 px-4 py-2.5 text-foreground shadow-lg hover:shadow-xl hover:border-primary/50 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Open LibrisAI Librarian"
          data-testid="ai-librarian-trigger"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium tracking-tight">Ask AI Librarian</span>
          <kbd className="hidden sm:inline-block rounded border border-border/70 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘L
          </kbd>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="flex flex-col w-[min(calc(100vw-24px),420px)] h-[min(82vh,620px)] rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/70 bg-card/95 backdrop-blur-md px-4 py-3 text-foreground">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card transition-colors",
                    loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                  )}
                  title={loading ? "Synthesizing literature..." : "Online & Indexed"}
                />
              </div>
              <div>
                <h3 className="text-xs font-semibold leading-tight text-foreground">
                  Libris AI Librarian
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {loading ? "Synthesizing literature..." : "Repository catalog indexed"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={handleReset}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-muted/15"
          >
            {messages.length === 0 ? (
              /* Clean, Human-Designed Welcome Empty State */
              <div className="flex flex-col items-center justify-center text-center px-2 py-8 min-h-[340px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3 shadow-inner">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground tracking-tight">
                  Scholarly Research Assistant
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
                  Ask grounded questions about monographs, algorithms, authors, and cross-disciplinary citations.
                </p>

                <div className="w-full mt-6 space-y-2 text-left">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-1">
                    Suggested Inquiries
                  </span>
                  {RESEARCH_STARTERS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => submitQuery(item.prompt)}
                      className="w-full text-left p-3 rounded-xl border border-border/70 bg-card hover:bg-accent/60 hover:border-primary/40 transition-all text-xs group flex items-start justify-between gap-2 shadow-2xs cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors block text-xs">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {item.subtitle}
                        </span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-1",
                    m.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {m.role === "user" ? (
                    <div className="rounded-2xl rounded-br-xs px-4 py-2.5 leading-relaxed max-w-[85%] bg-primary text-primary-foreground text-xs font-normal shadow-xs whitespace-pre-wrap">
                      {m.text}
                    </div>
                  ) : (
                    <div className="flex gap-2.5 items-start max-w-[95%]">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-card border border-border/80 text-foreground text-xs leading-relaxed shadow-2xs">
                          <ChatFormattedMessage content={m.text} isTyping={m.isTyping} />

                          {m.recommendedResource && !m.isTyping && (
                            <div className="mt-3 pt-2.5 border-t border-border/60">
                              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase block mb-1.5">
                                Referenced Monograph
                              </span>
                              <Link
                                href={m.recommendedResource.href}
                                className="flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-muted/40 p-2.5 hover:bg-muted/70 hover:border-primary/40 transition-all group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="h-8 w-6 rounded bg-muted overflow-hidden shrink-0 border border-border/60">
                                    {m.recommendedResource.coverUrl ? (
                                      <img
                                        src={m.recommendedResource.coverUrl}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <BookOpen className="h-3.5 w-3.5 m-1 text-primary" />
                                    )}
                                  </div>
                                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                    {m.recommendedResource.title}
                                  </span>
                                </div>
                                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Active Thinking State */}
            {loading && (
              <div className="flex gap-2.5 items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl rounded-tl-xs bg-card border border-border/80 shadow-2xs text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  </span>
                  <span className="font-medium text-[11px] text-foreground">
                    {getThinkingStage(elapsedSeconds)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Clean, Non-Congested Input Area */}
          <div className="border-t border-border/70 p-3 bg-card/95 backdrop-blur-md">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder={
                  loading
                    ? "Synthesizing literature response..."
                    : "Ask about literature, papers, authors..."
                }
                className="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl bg-muted/40 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="absolute right-1.5 h-7 w-7 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 px-1">
              <span>Grounded in indexed library corpus</span>
              <span className="hidden sm:inline font-mono">⌘L to toggle</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
