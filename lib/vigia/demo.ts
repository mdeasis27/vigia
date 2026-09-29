// lib/vigia/demo.ts
// Wires the committed repo snapshot into every number the dashboard displays.

import snapshotRaw from "./data/snapshot.json";
import { benchmark } from "./benchmark";
import { extractSymbols } from "./extract";
import type { DetectionResult, Snapshot } from "./types";

const SNAPSHOT = snapshotRaw as unknown as Snapshot;

let memo: DetectionResult | null = null;

export function getResult(): DetectionResult {
  if (!memo) {
    memo = benchmark(SNAPSHOT);
  }
  return memo;
}

export function getSymbols(): string[] {
  return extractSymbols(SNAPSHOT.source);
}

export function getRenames(): Record<string, string> {
  return SNAPSHOT.renames;
}

export function getSnapshot(): Snapshot {
  return SNAPSHOT;
}
