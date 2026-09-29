// lib/vigia/extract.ts
// Deterministic symbol and reference extraction. Symbols come from `export
// function <name>` in source; doc references come from backtick code spans.
// Mirrors backend/src/vigia/extract.py.

import type { SourceFile } from "./types";

const SYMBOL_RE = /export\s+function\s+([A-Za-z_][A-Za-z0-9_]*)/g;
const REF_RE = /`([A-Za-z_][A-Za-z0-9_]*)`/g;

export function extractSymbols(source: readonly SourceFile[]): string[] {
  const symbols = new Set<string>();
  for (const f of source) {
    let m: RegExpExecArray | null;
    const re = new RegExp(SYMBOL_RE.source, "g");
    while ((m = re.exec(f.content))) symbols.add(m[1]);
  }
  return [...symbols];
}

export function extractReferences(content: string): string[] {
  const refs = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(REF_RE.source, "g");
  while ((m = re.exec(content))) refs.add(m[1]);
  return [...refs];
}
