// lib/vigia/outcomes.ts
// What happens to every doc reference when the rename notice lists only its
// first k renames: still valid, renamed automatically, or broken until a person
// fixes it. References are taken per doc in sorted order so TypeScript and
// Python agree. Mirrors backend/src/vigia/outcomes.py.

import { extractReferences, extractSymbols } from "./extract";
import type { Snapshot } from "./types";

export type ReferenceOutcome = { docId: string; symbol: string; status: "served" | "rerouted" | "lost" };

export function referenceOutcomes(snapshot: Snapshot, knownRenames: number = Object.keys(snapshot.renames).length): ReferenceOutcome[] {
  const total = Object.keys(snapshot.renames).length;
  if (!Number.isSafeInteger(knownRenames) || knownRenames < 0 || knownRenames > total) throw new Error(`knownRenames must be 0 to ${total}.`);
  const symbols = new Set(extractSymbols(snapshot.source));
  const known = new Set(Object.keys(snapshot.renames).slice(0, knownRenames));
  return snapshot.docs.flatMap((doc) =>
    [...extractReferences(doc.content)].sort().map((symbol) => ({
      docId: doc.id,
      symbol,
      status: symbols.has(symbol) ? "served" : known.has(symbol) ? "rerouted" : "lost",
    })),
  );
}
