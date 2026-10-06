"use client";
import type { CSSProperties } from "react";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts, type TapeStatus } from "@/design-system/demo/outcome-tape";
import { TOTAL_RENAMES, type MissionResult } from "./mission";
import { displayName, groupStart, referenceCells, revealedReferences, usedNotice } from "./scene-state";
import { STORY } from "./story";

type Status = Exclude<TapeStatus, "pending">;
const STATUSES: Status[] = ["served", "rerouted", "lost"];
const MARK: Record<Status, string> = { served: "✓", rerouted: "↻", lost: "×" };
const MARK_BG: Record<Status, string> = { served: "bg-success", rerouted: "bg-info", lost: "bg-danger" };
const SIGN: Record<TapeStatus, string> = {
  pending: "border-border bg-background text-muted-foreground",
  served: "border-success bg-success/10",
  rerouted: "border-info bg-info/15",
  lost: "border-dashed border-danger bg-danger/10",
};
/** The inspector reaches the signs of a freshly revealed group one after another. */
const STAGGER_MS = 120;

export function VigiaStoryScene({ frame, result, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const { items, pages, notice } = result;
  const n = items.length;
  const revealed = revealedReferences(frame, n, reduced);
  const c = tapeCounts(referenceCells(items, revealed));
  const start = groupStart(revealed);
  const used = usedNotice(items, revealed);
  const done = revealed === n;
  const last = revealed > 0 ? items[revealed - 1] : undefined;
  const pageName = (id: string) => pages.find(p => p.id === id)?.name ?? id;
  const counts = STATUSES.map(s => `${copy.tape[s]}: ${c[s]}`).join(" · ");
  const ticker = done ? `${copy.checked(n)} · ${counts}`
    : last ? `${pageName(last.docId)} · ${last.symbol}${last.status === "rerouted" ? ` → ${displayName(last, notice)}` : ""}: ${copy.say[last.status]}`
    : copy.waiting;
  const delay = (i: number): CSSProperties | undefined => reduced ? undefined : { transitionDelay: `${(i - start) * STAGGER_MS}ms`, animationDelay: `${(i - start) * STAGGER_MS}ms` };
  const indexed = items.map((item, i) => ({ item, i }));

  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <div role="img" aria-label={`${copy.mapLabel(pages.length, n)} ${copy.checked(revealed)}: ${counts.replaceAll(" · ", ", ")}.`} data-vigia-map>
      <p aria-hidden="true" className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{copy.mapTitle(pages.length)}</p>
      <ol aria-hidden="true" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {pages.map(page => <li key={page.id} className="min-w-0 rounded-md border border-border bg-muted/40 p-2">
          <p className="mb-1.5 truncate font-mono text-[11px] text-muted-foreground">{page.name}</p>
          <ul className="space-y-1">
            {indexed.filter(({ item }) => item.docId === page.id).map(({ item, i }) => {
              const status: TapeStatus = i < revealed ? item.status : "pending";
              const fresh = !reduced && i >= start && i < revealed;
              const here = !done && i === revealed - 1;
              return <li key={i} data-sign={status} data-symbol={item.symbol} style={fresh ? delay(i) : undefined}
                className={`flex items-center gap-1 rounded border px-1.5 py-1 font-mono text-[11px] leading-4 transition-colors duration-300 motion-reduce:transition-none ${SIGN[status]} ${fresh ? "vigia-inspect" : ""}`}>
                {here ? <span data-inspector title={copy.inspector} style={delay(i)} className="vigia-lamp size-2 shrink-0 rounded-full bg-warning ring-2 ring-warning/30" /> : null}
                <span className={`min-w-0 flex-1 truncate ${status === "lost" ? "text-danger line-through" : ""}`}>{status === "pending" ? item.symbol : displayName(item, notice)}</span>
                <span className={`inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold text-white ${status === "pending" ? "" : MARK_BG[status]}`}>{status === "pending" ? "" : MARK[status]}</span>
              </li>;
            })}
          </ul>
        </li>)}
      </ol>
      <p aria-hidden="true" data-vigia-ticker className="mt-3 min-h-10 font-mono text-xs leading-5 text-muted-foreground">{ticker}</p>
      <div aria-hidden="true" className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-3">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-warning">{copy.noticeTitle}</p>
          {notice.length === 0 ? <p className="text-xs text-muted-foreground">{copy.noticeEmpty}</p>
            : <ul className="space-y-0.5">{notice.map(entry => <li key={entry.from} data-notice-used={used.has(entry.from) || undefined}
              className={`break-words rounded px-1 font-mono text-[11px] leading-5 transition-colors duration-300 motion-reduce:transition-none ${used.has(entry.from) ? "bg-info/20" : ""}`}>{entry.from} → {entry.to}</li>)}</ul>}
          <p className="mt-1.5 text-[11px] text-muted-foreground">{copy.noticeNote(notice.length, TOTAL_RENAMES)}</p>
        </div>
        <ul className="space-y-1.5 self-center text-sm">
          {STATUSES.map(s => <li key={s} className="flex items-center gap-2">
            <span className={`inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold text-white ${MARK_BG[s]}`}>{MARK[s]}</span>
            <span>{copy.tape[s]}: <b className="font-mono" data-count={s}>{c[s]}</b></span>
          </li>)}
        </ul>
      </div>
    </div>
    <div className="mt-6">
      <OutcomeTape cells={referenceCells(items, revealed)} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={10} />
      <p data-by-hand className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.byHandOf(c.lost, result.comparison.none)}</p>
    </div>
  </StoryStage>;
}
