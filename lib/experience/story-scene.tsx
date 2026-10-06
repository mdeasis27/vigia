"use client";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { FlowDiagram, type FlowTone } from "@/design-system/demo/flow-diagram";
import type { MissionResult } from "./mission";
import { referenceCells, revealedReferences } from "./scene-state";
import { STORY } from "./story";

const POS = { docs: { x: 10, y: 95 }, watcher: { x: 230, y: 95 }, renamed: { x: 470, y: 20 }, person: { x: 470, y: 170 } } as const;

export function VigiaStoryScene({ frame, result, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const cells = referenceCells(result.items, revealedReferences(frame, result.items.length, reduced));
  const c = tapeCounts(cells);
  const tone: Record<keyof typeof POS, FlowTone> = {
    docs: "idle",
    watcher: "active",
    renamed: c.rerouted > 0 ? "success" : "idle",
    person: c.lost > 0 ? "danger" : "idle",
  };
  const nodes = (Object.keys(POS) as (keyof typeof POS)[]).map(id => ({ id, ...POS[id], ...copy.nodes[id], tone: tone[id] }));
  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <FlowDiagram nodes={nodes} width={640} height={260} ariaLabel={copy.byHandOf(c.lost)} statusLabels={copy.statusLabels} edges={[
      { from: "docs", to: "watcher" },
      { from: "watcher", to: "renamed", tone: c.rerouted > 0 ? "success" : "idle" },
      { from: "watcher", to: "person", tone: c.lost > 0 ? "danger" : "idle" },
    ]} />
    <div className="mt-6">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={10} />
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.byHandOf(c.lost)}</p>
    </div>
  </StoryStage>;
}
