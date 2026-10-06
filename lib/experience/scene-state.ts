import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { ReferenceOutcome } from "@/lib/vigia/outcomes";
import { GROUP } from "./mission";

export function referenceCells(items: readonly ReferenceOutcome[], revealed: number): TapeStatus[] {
  return items.map((r, i) => (i >= revealed ? "pending" : r.status));
}

export function revealedReferences(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.min(n, frame.visible * GROUP);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };
