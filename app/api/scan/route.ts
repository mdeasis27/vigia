import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";
import { extractSymbols } from "@/lib/vigia/extract";
import { detect } from "@/lib/vigia/detect";
import type { DocFile, SourceFile } from "@/lib/vigia/types";

const RENAMES: Record<string, string> = { getUserScore: "getCreditScore" };

function parseSource(text: string): SourceFile[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const m = line.match(/^([\w./-]+\.(?:ts|tsx|js|jsx|py))\s*:\s*(.*)$/);
      if (m) return { path: m[1], content: m[2] };
      return { path: `src/file${i + 1}.ts`, content: line };
    });
}

function parseDocs(text: string): DocFile[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => ({
      id: `doc${i + 1}`,
      path: `docs/${i + 1}.md`,
      content: line,
    }));
}

export async function POST(request: Request) {
  let sourceText: string;
  let docsText: string;
  try {
    const body = await request.json();
    sourceText = typeof body.source === "string" ? body.source : "";
    docsText = typeof body.docs === "string" ? body.docs : "";
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!sourceText.trim() || !docsText.trim()) {
    return NextResponse.json({ error: "Escribe código fuente y docs" }, { status: 400 });
  }

  const source = parseSource(sourceText);
  const docs = parseDocs(docsText);
  const symbols = extractSymbols(source);
  const result = detect(symbols, RENAMES, docs, []);

  try {
    const db = getSql();
    await db`INSERT INTO vigia.scans (symbols, stale_docs, auto_corrected) VALUES (${result.symbolsExtracted}, ${result.detectedStaleDocs}, ${result.autoCorrected})`;

    return NextResponse.json({ ...result, symbols });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error guardando el scan" },
      { status: 500 },
    );
  }
}
