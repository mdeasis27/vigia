import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { ReferenceOutcome } from "@/lib/vigia/outcomes";
import { GROUP, type NoticeEntry } from "./mission";

export function referenceCells(items: readonly ReferenceOutcome[], revealed: number): TapeStatus[] {
  return items.map((r, i) => (i >= revealed ? "pending" : r.status));
}

export function revealedReferences(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.min(n, frame.visible * GROUP);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };

/** A renamed reference shows the name the notice gave it. */
export function displayName(item: ReferenceOutcome, notice: readonly NoticeEntry[]): string {
  return item.status === "rerouted" ? notice.find((n) => n.from === item.symbol)?.to ?? item.symbol : item.symbol;
}

/** Index of the first reference in the group revealed last; the inspector walks that group. */
export function groupStart(revealed: number): number {
  return revealed === 0 ? 0 : Math.floor((revealed - 1) / GROUP) * GROUP;
}

/** Old names of the notice lines applied by the references revealed so far, in order. */
export function usedNotice(items: readonly ReferenceOutcome[], revealed: number): Set<string> {
  return new Set(items.slice(0, revealed).filter((r) => r.status === "rerouted").map((r) => r.symbol));
}
