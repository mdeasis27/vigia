import { describe, expect, it } from "vitest";
import snapshotRaw from "./data/snapshot.json";
import fixture from "./fixtures/outcomes.json";
import { referenceOutcomes } from "./outcomes";
import type { Snapshot } from "./types";

const SNAPSHOT = snapshotRaw as unknown as Snapshot;
const byHand = (k: number) => referenceOutcomes(SNAPSHOT, k).filter((r) => r.status === "lost").length;

describe("referenceOutcomes", () => {
  it("covers 19 references, 7 of them broken", () => {
    const all = referenceOutcomes(SNAPSHOT, 0);
    expect(all).toHaveLength(19);
    expect(all.filter((r) => r.status === "served")).toHaveLength(12);
  });

  it("each recorded rename moves one broken reference from by-hand to automatic", () => {
    expect([0, 1, 2, 3, 4, 5].map(byHand)).toEqual([7, 6, 5, 4, 3, 2]);
  });

  it("matches the per-reference outcomes pinned for Python", () => {
    for (const [k, expected] of Object.entries(fixture.outcomes)) expect(referenceOutcomes(SNAPSHOT, Number(k))).toEqual(expected);
  });
});
