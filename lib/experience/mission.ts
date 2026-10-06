import snapshotRaw from "@/lib/vigia/data/snapshot.json";
import { referenceOutcomes, type ReferenceOutcome } from "@/lib/vigia/outcomes";
import type { Snapshot } from "@/lib/vigia/types";
import type { DemoAdapter, TraceEvent } from "@/design-system/demo/types";

export type MissionInput = { renames: number };
export type MissionResult = { items: ReferenceOutcome[]; byHand: number; comparison: { watcher: number; none: number } };

/** References are revealed in groups of five, matching the trace. */
export const GROUP = 5;
const SNAPSHOT = snapshotRaw as unknown as Snapshot;
export const TOTAL_RENAMES = Object.keys(SNAPSHOT.renames).length;

export function checkReferences(renames: number): ReferenceOutcome[] {
  return referenceOutcomes(SNAPSHOT, renames);
}

export const runMission: DemoAdapter<MissionInput, MissionResult> = async (input, signal, onEvent) => {
  const startedAt = performance.now();
  const items = checkReferences(input.renames);
  const trace: TraceEvent[] = [];
  for (let i = 0; i < items.length; i += GROUP) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const event: TraceEvent = { id: `batch-${i / GROUP + 1}`, step: i / GROUP + 1, kind: "check", messageKey: `batch.${i / GROUP + 1}`, timestampMs: performance.now() - startedAt, evidenceIds: items.slice(i, i + GROUP).map((r) => `${r.docId}:${r.symbol}`) };
    trace.push(event);
    onEvent(event);
  }
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const broken = items.filter((r) => r.status !== "served").length;
  // With the watcher every broken reference is found (renamed or flagged); without it, none is.
  return { input, result: { items, byHand: items.filter((r) => r.status === "lost").length, comparison: { watcher: 0, none: broken } }, trace, executionMs: performance.now() - startedAt, mode: "local" };
};
