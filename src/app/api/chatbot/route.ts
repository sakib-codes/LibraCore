import { NextRequest, NextResponse } from "next/server";
import { chatWithLibrarian, type ChatHistoryItem } from "@/lib/chatbot.server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let rawMessages = body.messages;
    if (!rawMessages && body.message) {
      const history = Array.isArray(body.history) ? body.history : [];
      rawMessages = [...history, { role: "user", text: body.message }];
    }

    const formattedMessages: ChatHistoryItem[] = (rawMessages || []).map((m: any) => ({
      role: m.role || "user",
      text: m.text || m.content || "",
    }));

    const response = await chatWithLibrarian(formattedMessages, body.userContext);
    return NextResponse.json(response);
  } catch (error) {
    console.error("API /api/chatbot handler error:", error);
    return NextResponse.json(
      {
        reply: "The LibrisAI Assistant encountered an unexpected error. Please try again.",
        suggestions: [
          "📚 Browse Library Catalog",
          "🔍 How do I search for books?",
          "💡 Explain library features",
        ],
      },
      { status: 500 }
    );
  }
}
