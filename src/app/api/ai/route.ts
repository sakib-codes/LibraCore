import { NextRequest, NextResponse } from "next/server";
import {
  chatWithLibrarian,
  askBookContextualQuestion,
  generateBookDescription,
} from "@/lib/chatbot.server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Global AI Librarian Chat
    if (action === "chat") {
      const { messages = [], userContext } = body;
      const formatted = messages.map((m: any) => ({
        role: m.role || "user",
        text: m.text || m.content || "",
      }));
      const result = await chatWithLibrarian(formatted, userContext);
      return NextResponse.json({ success: true, result: result.reply, suggestions: result.suggestions });
    }

    // 2. Contextual Book Q&A
    if (action === "book-qa") {
      const { bookTitle, author, category, description, question } = body;
      if (!bookTitle || !question) {
        return NextResponse.json(
          { error: "Missing required fields (bookTitle, question)" },
          { status: 400 }
        );
      }
      const result = await askBookContextualQuestion({
        bookTitle,
        author: author || "Unknown Author",
        category,
        description,
        question,
      });
      return NextResponse.json({ success: true, result });
    }

    // 3. Admin One-Click Description Generator
    if (action === "generate-summary") {
      const { title, author, category } = body;
      if (!title) {
        return NextResponse.json(
          { error: "Title is required for description generation" },
          { status: 400 }
        );
      }
      const description = await generateBookDescription({
        title,
        author: author || "Unknown Author",
        category,
      });
      return NextResponse.json({
        success: true,
        result: {
          description,
          aiSummary: description.slice(0, 140) + "...",
        },
      });
    }

    return NextResponse.json({ error: "Invalid action requested" }, { status: 400 });
  } catch (error) {
    console.error("API /api/ai route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Gemini API handler" },
      { status: 500 }
    );
  }
}
