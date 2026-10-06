import { describe, expect, it } from "vitest";

import snapshotRaw from "./data/snapshot.json";
import fixture from "./fixtures/detection.json";
import { benchmark } from "./benchmark";
import type { Snapshot } from "./types";

const SNAPSHOT = snapshotRaw as unknown as Snapshot;

describe("pinned fixture: detection", () => {
  it("reproduces detection recall and auto-correction rate", () => {
    const result = benchmark(SNAPSHOT);

    expect(result.symbolsExtracted).toBe(fixture.symbolsExtracted);
    expect(result.referencesFound).toBe(fixture.referencesFound);
    expect(result.staleDocs).toBe(fixture.staleDocs);
    expect(result.detectedStaleDocs).toBe(fixture.detectedStaleDocs);
    expect(result.detectionRecall).toBeCloseTo(fixture.detectionRecall, 10);
    expect(result.falsePositives).toBe(fixture.falsePositives);
    expect(result.staleReferences).toBe(fixture.staleReferences);
    expect(result.autoCorrected).toBe(fixture.autoCorrected);
    expect(result.flaggedOnly).toBe(fixture.flaggedOnly);
    expect(result.autoCorrectionRate).toBeCloseTo(fixture.autoCorrectionRate, 10);
  });
});

describe("staleness + auto-correction", () => {
  it("flags exactly the ground-truth stale docs", () => {
    const result = benchmark(SNAPSHOT);
    const staleIds = result.docs.filter((d) => d.stale).map((d) => d.id);
    expect(staleIds).toEqual(["d02", "d03", "d05", "d07", "d09", "d11"]);
  });

  it("auto-corrects renames and flags removals", () => {
    const result = benchmark(SNAPSHOT);
    const d02 = result.docs.find((d) => d.id === "d02")!;
    const d03 = result.docs.find((d) => d.id === "d03")!;

    expect(d02.staleReferences).toEqual([
      { docId: "d02", symbol: "getUserScore", corrected: "getCreditScore" },
    ]);
    expect(d02.correctedContent).toContain("`getCreditScore`");

    const removal = d03.staleReferences.find((r) => r.symbol === "computeScore")!;
    expect(removal.corrected).toBeNull();
    expect(d03.staleReferences.find((r) => r.symbol === "getRiskLevel")!.corrected).toBe("getRiskTier");
  });
});
