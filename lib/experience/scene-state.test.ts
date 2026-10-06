import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { displayName, groupStart, referenceCells, revealedReferences, usedNotice } from "./scene-state";
import { runMission } from "./mission";

it("hides the references not revealed yet", () => {
  expect(referenceCells([{ docId: "d1", symbol: "a", status: "served" }, { docId: "d1", symbol: "b", status: "lost" }], 1)).toEqual(["served", "pending"]);
});

it("final tape counts equal the mission totals", async () => {
  const { result } = await runMission({ renames: 2 }, new AbortController().signal, () => {});
  expect(tapeCounts(referenceCells(result.items, result.items.length))).toEqual({ served: 12, rerouted: 2, lost: result.byHand, pending: 0 });
});

it("reveals the same groups the trace reports, all of it when complete or under reduced motion", () => {
  expect([1, 2, 3, 4].map(v => revealedReferences({ visible: v, total: 4, complete: false }, 19, false))).toEqual([5, 10, 15, 19]);
  expect(revealedReferences({ visible: 1, total: 4, complete: false }, 19, true)).toBe(19);
});

it("shows the new name on renamed references and keeps the old one otherwise", () => {
  const notice = [{ from: "old", to: "fresh" }];
  expect(displayName({ docId: "d1", symbol: "old", status: "rerouted" }, notice)).toBe("fresh");
  expect(displayName({ docId: "d1", symbol: "gone", status: "lost" }, notice)).toBe("gone");
});

it("knows where the latest group starts and which notice lines were used so far", async () => {
  expect([0, 5, 10, 19].map(groupStart)).toEqual([0, 0, 5, 15]);
  const { result } = await runMission({ renames: 2 }, new AbortController().signal, () => {});
  expect([...usedNotice(result.items, 3)]).toEqual(["getUserScore"]);
  expect([...usedNotice(result.items, 19)]).toEqual(["getUserScore", "getRiskLevel"]);
  expect([...usedNotice(result.items, 0)]).toEqual([]);
});
