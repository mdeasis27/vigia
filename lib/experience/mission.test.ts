import { expect, it } from "vitest";
import { checkReferences, runMission, TOTAL_RENAMES } from "./mission";

const byHand = (k: number) => checkReferences(k).filter(r => r.status === "lost").length;

it("with 2 renames on record, 5 broken references are left for a person", () => {
  const items = checkReferences(2);
  expect(items.filter(r => r.status === "served")).toHaveLength(12);
  expect(items.filter(r => r.status === "rerouted")).toHaveLength(2);
  expect(byHand(2)).toBe(5);
});

it("sweep: both bet answers are reachable on the slider, and the default says no", () => {
  const answers = new Set<boolean>();
  for (let k = 0; k <= TOTAL_RENAMES; k++) answers.add(byHand(k) <= 3);
  expect([...answers].sort()).toEqual([false, true]);
  expect(byHand(3) <= 3).toBe(false);
  expect(byHand(4) <= 3).toBe(true);
});

it("runs the mission, reveals in groups of five and stops when cancelled", async () => {
  const ids: string[] = [];
  const run = await runMission({ renames: 2 }, new AbortController().signal, e => ids.push(e.id));
  expect(run.result.items).toHaveLength(19);
  expect(run.result.comparison).toEqual({ watcher: 0, none: 7 });
  expect(ids).toHaveLength(4);
  const c = new AbortController(); c.abort();
  await expect(runMission({ renames: 2 }, c.signal, () => {})).rejects.toThrow();
});

it("carries the pages and the notice cut to the renames on record", async () => {
  const run = (k: number) => runMission({ renames: k }, new AbortController().signal, () => {});
  const two = (await run(2)).result;
  expect(two.pages).toHaveLength(12);
  expect(two.pages[0]).toEqual({ id: "d01", name: "api.md" });
  expect(two.notice).toEqual([{ from: "getUserScore", to: "getCreditScore" }, { from: "getRiskLevel", to: "getRiskTier" }]);
  expect((await run(0)).result.notice).toEqual([]);
  expect((await run(5)).result.notice).toHaveLength(TOTAL_RENAMES);
  for (const k of [0, 2, 5]) {
    const r = (await run(k)).result;
    const notice = new Set(r.notice.map(n => n.from));
    expect(r.items.filter(i => i.status === "rerouted").every(i => notice.has(i.symbol))).toBe(true);
  }
});
