#!/usr/bin/env python3
"""
scripts/markitdown_service.py
-----------------------------
Bridge service for Microsoft MarkItDown in LibraCore (LibrisAI).
Converts PDF, DOCX, PPTX, XLSX, HTML, images, and audio files into clean,
token-efficient semantic Markdown.
"""

import sys
import os
import json
import re
import argparse
import tempfile
import urllib.request
from typing import Dict, Any, List

try:
    from markitdown import MarkItDown
except ImportError:
    MarkItDown = None


def estimate_tokens(text: str) -> int:
    """Approximate tokens: roughly 1 token per 4 characters in English."""
    return max(1, len(text) // 4)


def extract_sections(markdown_text: str) -> List[Dict[str, Any]]:
    """Parse markdown headings (#, ##, ###) into structured sections."""
    sections = []
    lines = markdown_text.splitlines()
    for idx, line in enumerate(lines):
        match = re.match(r"^(#{1,4})\s+(.+)$", line.strip())
        if match:
            level = len(match.group(1))
            title = match.group(2).strip()
            sections.append({
                "level": level,
                "title": title,
                "line": idx + 1
            })
    return sections


def convert_document(file_path_or_url: str) -> Dict[str, Any]:
    """
    Convert a document file or URL into clean Markdown using Microsoft MarkItDown.
    """
    if not MarkItDown:
        return {
            "success": False,
            "error": "markitdown is not installed in the active Python environment."
        }

    temp_download = None
    input_target = file_path_or_url

    # Handle remote URLs by streaming to a temp file
    if file_path_or_url.startswith("http://") or file_path_or_url.startswith("https://"):
        try:
            req = urllib.request.Request(
                file_path_or_url,
                headers={"User-Agent": "LibrisAI-MarkItDown-Client/1.0"}
            )
            ext = os.path.splitext(file_path_or_url.split("?")[0])[1] or ".pdf"
            temp_download = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
            with urllib.request.urlopen(req, timeout=20) as resp, open(temp_download.name, "wb") as f:
                f.write(resp.read())
            input_target = temp_download.name
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch remote document URL: {str(e)}"
            }

    try:
        md = MarkItDown()
        result = md.convert(input_target)
        raw_text = result.text_content or ""

        # Remove excessive whitespace runs while preserving markdown formatting
        cleaned_markdown = re.sub(r"\n{3,}", "\n\n", raw_text).strip()

        # Extract title (either from first H1 or metadata)
        title_match = re.search(r"^#\s+(.+)$", cleaned_markdown, re.MULTILINE)
        extracted_title = title_match.group(1).strip() if title_match else os.path.basename(file_path_or_url)

        # Estimate raw document overhead vs. clean markdown
        file_size_bytes = os.path.getsize(input_target) if os.path.exists(input_target) else len(raw_text) * 2
        # Base64 or binary PDF overhead is typically 3x to 5x higher in token weight
        estimated_raw_pdf_tokens = max(estimate_tokens(cleaned_markdown) * 3, file_size_bytes // 3)
        markdown_tokens = estimate_tokens(cleaned_markdown)
        tokens_saved_percent = max(0, min(95, round((1.0 - (markdown_tokens / max(1, estimated_raw_pdf_tokens))) * 100, 1)))

        sections = extract_sections(cleaned_markdown)

        return {
            "success": True,
            "title": extracted_title,
            "markdown": cleaned_markdown,
            "tokenCount": markdown_tokens,
            "estimatedRawTokens": estimated_raw_pdf_tokens,
            "tokensSavedPercent": tokens_saved_percent,
            "charCount": len(cleaned_markdown),
            "sections": sections,
            "sectionCount": len(sections),
            "fileSize": file_size_bytes
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"MarkItDown conversion error: {str(e)}"
        }
    finally:
        if temp_download and os.path.exists(temp_download.name):
            try:
                os.remove(temp_download.name)
            except OSError:
                pass


def main():
    parser = argparse.ArgumentParser(description="Convert files to clean Markdown using Microsoft MarkItDown.")
    parser.add_argument("input", help="Path to local file or public URL")
    parser.add_argument("--output", "-o", help="Optional output markdown file path")
    parser.add_argument("--json", action="store_true", default=True, help="Output JSON structure with token metrics")

    args = parser.parse_args()

    res = convert_document(args.input)

    if args.output and res.get("success"):
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(res["markdown"])

    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
