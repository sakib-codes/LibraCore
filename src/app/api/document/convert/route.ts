import { NextRequest, NextResponse } from "next/server";
import { convertDocumentWithMarkItDown } from "@/lib/markitdown.server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl, title, author, category, description } = body;

    const result = await convertDocumentWithMarkItDown(fileUrl || "", {
      title: title || "Academic Monograph Document",
      author: author || "Scholarly Researcher",
      category: category || "Computer Science",
      description: description || "",
    });

    return NextResponse.json({
      ...result,
      percentSaved: result.tokensSavedPercent,
      tokensUsed: result.tokenCount,
      estimatedOriginalTokens: result.estimatedRawTokens,
    });
  } catch (error: any) {
    console.error("[API Convert Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Document conversion failed" },
      { status: 500 }
    );
  }
}
