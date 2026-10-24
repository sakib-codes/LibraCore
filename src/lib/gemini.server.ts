import { GoogleGenAI } from "@google/genai";

let geminiClientInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClientInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    geminiClientInstance = new GoogleGenAI({ apiKey });
  }
  return geminiClientInstance;
}

export const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";

export interface LibrarianChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Global AI Librarian chat assistant
 */
export async function askLibrarianChat(
  messages: LibrarianChatMessage[],
  userContext?: { userName?: string; role?: string }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return (
      "I'm your **LibrisAI Librarian**. (Note: `GEMINI_API_KEY` is not set in environment variables. " +
      "Once configured, I will provide live AI-powered catalog searches, reading guidance, and document analysis.)"
    );
  }

  try {
    const ai = getGeminiClient();

    const systemPrompt = `You are LibrisAI, an erudite, engaging, and highly knowledgeable digital librarian and research assistant.
You assist users with catalog discovery, literature analysis, study recommendations, and understanding documents (PDF, EPUB, Audiobooks, Research notes).
Maintain a helpful, intellectual, and encouraging tone.
When suggesting materials, recommend genres, notable authors, or reading paths.
Current user context: ${userContext?.userName ? `User: ${userContext.userName}` : "Guest reader"} (${userContext?.role || "user"}).`;

    const formattedContents = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");

    const response = await ai.models.generateContent({
      model: GEMINI_DEFAULT_MODEL,
      contents: `${systemPrompt}\n\nChat History:\n${formattedContents}\n\nLIBRARIAN:`,
    });

    return response.text || "I was unable to synthesize a response. Please try again.";
  } catch (error: unknown) {
    console.error("Gemini API error in askLibrarianChat:", error);
    return "The Librarian is temporarily unavailable. Please verify your GEMINI_API_KEY or network connection.";
  }
}

/**
 * Contextual Q&A about a specific book or document
 */
export async function askBookQuestion({
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
    return `Analysis for "${bookTitle}" by ${author}: To enable live contextual book answers, please set GEMINI_API_KEY in .env.local.`;
  }

  try {
    const ai = getGeminiClient();

    const prompt = `You are an expert literary and academic analyst specializing in the following work:
Title: "${bookTitle}"
Author: ${author}
Category: ${category || "General"}
Overview: ${description || "No overview provided"}

Reader's Question: "${question}"

Provide a concise, scholarly, and direct answer based on the concepts, themes, and content of this work.`;

    const response = await ai.models.generateContent({
      model: GEMINI_DEFAULT_MODEL,
      contents: prompt,
    });

    return response.text || "No insights generated for this question.";
  } catch (error: unknown) {
    console.error("Gemini API error in askBookQuestion:", error);
    return "Unable to process questions regarding this book at the moment.";
  }
}

/**
 * AI-powered metadata and summary generator for admins
 */
export async function generateAdminBookSummary({
  title,
  author,
  category,
  notes,
}: {
  title: string;
  author: string;
  category?: string;
  notes?: string;
}): Promise<{ description: string; aiSummary: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      description: `Comprehensive guide to ${title} authored by ${author}.`,
      aiSummary: `Key insights and thematic analysis for ${title}.`,
    };
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Generate a compelling library catalog description and a concise 2-sentence AI executive summary for this book:
Title: "${title}"
Author: ${author}
Category: ${category || "General"}
Additional Context: ${notes || "None"}

Return your answer strictly formatted as:
DESCRIPTION: <paragraph overview of 3-4 sentences>
SUMMARY: <high-level 1-2 sentence core insight>`;

    const response = await ai.models.generateContent({
      model: GEMINI_DEFAULT_MODEL,
      contents: prompt,
    });

    const text = response.text || "";
    const descMatch = text.match(/DESCRIPTION:\s*([\s\S]*?)(?=SUMMARY:|$)/i);
    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)$/i);

    return {
      description: descMatch ? descMatch[1].trim() : text.slice(0, 300),
      aiSummary: summaryMatch ? summaryMatch[1].trim() : text.slice(0, 150),
    };
  } catch (error) {
    console.error("Gemini API error in generateAdminBookSummary:", error);
    return {
      description: `${title} by ${author}.`,
      aiSummary: `Key conceptual points from ${title}.`,
    };
  }
}
