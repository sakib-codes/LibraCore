import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing required 'url' search parameter." },
        { status: 400 }
      );
    }

    // Support local public assets directly
    if (targetUrl.startsWith("/") && !targetUrl.startsWith("//")) {
      const origin = req.nextUrl.origin;
      const res = await fetch(`${origin}${targetUrl}`);
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch local PDF: ${res.statusText}` },
          { status: res.status }
        );
      }
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Validate valid HTTP/HTTPS protocol
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json(
        { error: "Invalid URL protocol. Only HTTP and HTTPS are permitted." },
        { status: 400 }
      );
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "LibrisAI-Academic-Proxy/1.0",
        Accept: "application/pdf,application/octet-stream,*/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream resource returned HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="monograph.pdf"',
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    console.error("[PDF Proxy Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error fetching PDF" },
      { status: 500 }
    );
  }
}
