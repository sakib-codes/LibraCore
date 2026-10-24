import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/integrations/supabase/client";

export type ChatHistoryItem = {
  role: "user" | "assistant" | "model" | "system";
  text: string;
};

export type ChatbotResponse = {
  reply: string;
  suggestions: string[];
};

type CatalogBookSummary = {
  id: string;
  title: string;
  author: string;
  category: string;
  file_type: string;
  description: string | null;
};

const DEFAULT_SUGGESTIONS = [
  "📚 Recommend Computer Science books",
  "🛡️ Find Network Security papers",
  "🎧 What audiobooks are in the catalog?",
  "💡 How do I download or bookmark resources?",
];

// Fallback catalog context if Supabase is offline or still initializing
const FALLBACK_BOOKS: CatalogBookSummary[] = [
  {
    id: "b1",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    category: "Computer Science",
    file_type: "PDF",
    description: "Reliable, scalable, and maintainable systems, replication, and distributed consensus.",
  },
  {
    id: "b2",
    title: "The Art of Computer Programming, Vol 1",
    author: "Donald E. Knuth",
    category: "Computer Science",
    file_type: "EPUB",
    description: "Fundamental Algorithms: information structures, memory allocation, and asymptotic analysis.",
  },
  {
    id: "b3",
    title: "Meditations: Audio Edition & Commentary",
    author: "Marcus Aurelius",
    category: "Audio Books",
    file_type: "AUDIO",
    description: "Stoic philosophical journal, mindfulness of mortality, and leadership resilience.",
  },
  {
    id: "b4",
    title: "Deep Learning Foundations & Tensor Methods",
    author: "Ian Goodfellow",
    category: "Research Papers",
    file_type: "PDF",
    description: "Neural network architectures, loss landscapes, and optimization theory.",
  },
];

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let cachedCatalog: CatalogBookSummary[] | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch books and categories from Supabase with in-memory caching
 */
export async function fetchCatalogContext(): Promise<CatalogBookSummary[]> {
  const now = Date.now();
  if (cachedCatalog && now - lastCacheTimestamp < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  try {
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, description, file_type, categories ( name )")
      .eq("is_archived", false)
      .limit(30);

    if (!error && data && data.length > 0) {
      cachedCatalog = (data as any[]).map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.categories?.name || "General",
        file_type: b.file_type?.toUpperCase() || "PDF",
        description: b.description ? b.description.slice(0, 200) : null,
      }));
      lastCacheTimestamp = now;
      return cachedCatalog;
    }
  } catch (err) {
    console.warn("[Chatbot] Falling back to default catalog context:", err);
  }

  return FALLBACK_BOOKS;
}

let geminiClientInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClientInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    geminiClientInstance = new GoogleGenAI({ apiKey });
  }
  return geminiClientInstance;
}

/**
 * Robust generation with multi-model fallback using Edge-native fetch & SDK fallback
 */
async function generateWithFallback(contents: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // 1. Standard Edge fetch (100% Cloudflare Workers / Edge Runtime compatible)
  const models = [GEMINI_MODEL, "gemini-2.5-flash", "gemini-3.8-flash", "gemini-1.5-flash"];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: contents }] }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err: any) {
      console.warn(`[Gemini REST] Model ${model} returned error: ${err?.message || err}. Trying next fallback...`);
    }
  }

  // 2. Secondary fallback via @google/genai SDK
  try {
    const ai = getGeminiClient();
    const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents });
    if (res.text) return res.text;
  } catch (err: any) {
    console.warn("[Gemini SDK] SDK fallback error:", err?.message || err);
  }

  return null;
}

/**
 * Global AI Librarian Chat Handler
 */
export async function chatWithLibrarian(
  messages: ChatHistoryItem[],
  userContext?: { userName?: string; role?: string }
): Promise<ChatbotResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      reply:
        "Hello! I am your **LibrisAI Librarian**. (Notice: `GEMINI_API_KEY` is not set yet in `.env.local`. " +
        "Once configured with your Google AI Studio key, I can answer questions and recommend exact books from the library.)\n\n" +
        "You can browse our featured resources:\n" +
        "- [Designing Data-Intensive Applications](/books/b1)\n" +
        "- [The Art of Computer Programming](/books/b2)\n" +
        "- [Meditations (Audio Edition)](/books/b3)",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  try {
    const catalog = await fetchCatalogContext();
    const catalogSummary = catalog
      .map(
        (b) =>
          `- [${b.title}](/books/${b.id}) by ${b.author} [Format: ${b.file_type}, Category: ${b.category}]: ${b.description || "Academic text"}`
      )
      .join("\n");

    const systemPrompt = `You are LibrisAI, an erudite, helpful academic digital librarian and research assistant.
Always format resource recommendations with markdown links using the EXACT relative path format: [Book Title](/books/BOOK_ID).
Available Books in LibrisAI Repository:
${catalogSummary}

Guidelines:
1. When recommending books from the catalog, strictly use the link format [Title](/books/<id>) so users can navigate directly to the book.
2. Be intellectual, concise, encouraging, and clear.
3. If asked about study topics, explain the concept simply and cite the best matching book from the catalog.
4. Current user: ${userContext?.userName || "Reader"}.`;

    const chatHistory = messages
      .map((m) => `${m.role === "assistant" || m.role === "model" ? "LIBRARIAN" : "USER"}: ${m.text}`)
      .join("\n\n");

    const prompt = `${systemPrompt}\n\nChat History:\n${chatHistory}\n\nLIBRARIAN:`;
    const reply = await generateWithFallback(prompt);

    // Generate dynamic suggestions
    const suggestions: string[] = [
      "📖 Tell me more about this recommendation",
      "🔍 What other formats are available?",
      "📚 Show related academic papers",
    ];

    return {
      reply: reply || "I was unable to retrieve a response from the library archive at this moment.",
      suggestions,
    };
  } catch (error) {
    console.error("[Chatbot Error]:", error);
    return {
      reply:
        "The LibrisAI Librarian service is temporarily unavailable. Please verify your connection or GEMINI_API_KEY.",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }
}

/**
 * Contextual Book Q&A for /books/[id]
 */
export async function askBookContextualQuestion({
  bookTitle,
  author,
  category,
  description,
  question,
}: {
  bookTitle: string;
  author: string;
  category?: string;
  description?: string;
  question: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `Contextual Q&A for "${bookTitle}" by ${author}: Please set GEMINI_API_KEY in .env.local to activate live book analysis.`;
  }

  try {
    const prompt = `You are an expert academic specialist reviewing the following library resource:
Title: "${bookTitle}"
Author: ${author}
Category: ${category || "General"}
Overview: ${description || "No description provided"}

Reader's Inquiry: "${question}"

Provide a direct, intellectually rigorous, and helpful answer analyzing the themes, concepts, or historical context of this work in 2-3 concise paragraphs.`;

    const reply = await generateWithFallback(prompt);
    return reply || "No insights could be formulated for this inquiry.";
  } catch (error) {
    console.error("[Book Q&A Error]:", error);
    return "The contextual analysis engine is currently offline. Please try again shortly.";
  }
}

/**
 * Admin One-Click Description Generator
 */
export async function generateBookDescription({
  title,
  author,
  category,
}: {
  title: string;
  author: string;
  category?: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `A comprehensive academic work on ${category || "foundational concepts"} authored by ${author}, providing essential theory, practical methodologies, and critical insights.`;
  }

  try {
    const prompt = `Write a concise, engaging, and professional 3-sentence academic library catalog description for this book:
Title: "${title}"
Author: "${author}"
Category: "${category || "General"}"

Requirements:
- Exactly 3 sentences.
- High intellectual polish and academic clarity.
- No introductory filler (e.g. "Here is the description").`;

    const reply = await generateWithFallback(prompt);
    return reply?.trim() || `${title} by ${author}.`;
  } catch (error) {
    console.error("[Description Generator Error]:", error);
    return `An authoritative guide to ${title} by ${author}.`;
  }
}
