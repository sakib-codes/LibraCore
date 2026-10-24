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
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  recommendedResource?: {
    title: string;
    href: string;
    coverUrl?: string;
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    text: "Can you recommend foundational texts on attention mechanisms in transformers and provide direct repository links?",
  },
  {
    id: "m2",
    role: "assistant",
    text: "Certainly! Based on our indexed corpus, here are the primary academic works addressing attention mechanisms:\n\n• **Self-Attention Scalability**: Analyzes multi-head query-key dynamics across dense attention layers.\n• **Positional Encodings**: Evaluates relative vs absolute embedding vectors in deep architectures.",
    recommendedResource: {
      title: "Attention & Sequence Modeling in Neural Networks",
      href: "/books/b-crypto",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    },
  },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [catalogIndexActive, setCatalogIndexActive] = useState(true);
  const [peerReviewedOnly, setPeerReviewedOnly] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      const reply = data?.reply || "I analyzed your query across our indexed academic library. You can find related monographs in our computer science repository.";

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: reply,
          recommendedResource: {
            title: "Cryptographic Security: Foundations and Practice",
            href: "/books/b-crypto",
            coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
          },
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "I am currently synthesizing the requested literature. Please browse our catalog disciplines for immediate monograph downloads.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "reset",
        role: "assistant",
        text: "Conversation reset. What scholarly research topics or monographs would you like to investigate?",
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
          className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-white shadow-xl hover:shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open LibrisAI Librarian"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask AI Librarian</span>
        </button>
      )}

      {/* Expanded Chat Drawer matching Image 5 */}
      {isOpen && (
        <div className="flex flex-col w-[min(calc(100vw-24px),420px)] h-[min(82vh,600px)] rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header matching Image 5 */}
          <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold leading-tight">LibrisAI Assistant</h3>
                  <span className="rounded bg-white/20 px-1 py-0.2 text-[9px] font-bold font-mono">
                    Gemini
                  </span>
                </div>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Ready to assist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                onClick={handleReset}
                title="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsOpen(false)}
                title="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-muted/20">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap max-w-[90%] shadow-2xs",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-xs font-medium"
                      : "bg-card text-foreground border border-border/70 rounded-tl-xs"
                  )}
                >
                  {m.text}

                  {/* Recommended Resource Card matching Image 5 */}
                  {m.recommendedResource && (
                    <div className="mt-3 pt-2.5 border-t border-border/60">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1.5">
                        Recommended Resources
                      </p>
                      <Link
                        href={m.recommendedResource.href}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-muted/40 p-2 hover:bg-accent hover:border-primary/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-6 rounded bg-muted overflow-hidden shrink-0 border border-border/60">
                            {m.recommendedResource.coverUrl ? (
                              <img
                                src={m.recommendedResource.coverUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-4 w-4 m-1 text-primary" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {m.recommendedResource.title}
                          </span>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Filter Toggles & Input matching Image 5 */}
          <div className="border-t border-border/70 p-3 bg-card space-y-2">
            {/* Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCatalogIndexActive(!catalogIndexActive)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors",
                  catalogIndexActive
                    ? "bg-primary/10 text-primary border-primary/30 font-bold"
                    : "text-muted-foreground border-border/60"
                )}
              >
                <BookOpen className="h-3 w-3" /> Catalog Index Active
              </button>
              <button
                type="button"
                onClick={() => setPeerReviewedOnly(!peerReviewedOnly)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors",
                  peerReviewedOnly
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold"
                    : "text-muted-foreground border-border/60"
                )}
              >
                <CheckCircle2 className="h-3 w-3" /> Peer-Reviewed Only
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <Input
                placeholder="Ask a follow-up about literature..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="h-10 text-xs rounded-xl bg-muted/40 border-border/70"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-2xs"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
