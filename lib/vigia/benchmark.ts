// lib/vigia/benchmark.ts
// Runs staleness detection over the committed snapshot and returns the metrics.

import { detect } from "./detect";
import { extractSymbols } from "./extract";
import type { DetectionResult, Snapshot } from "./types";

export function benchmark(snapshot: Snapshot): DetectionResult {
  const symbols = extractSymbols(snapshot.source);
  return detect(symbols, snapshot.renames, snapshot.docs, snapshot.staleDocs);
}
