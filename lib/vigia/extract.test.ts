import { describe, expect, it } from "vitest";

import { extractReferences, extractSymbols } from "./extract";

describe("extractSymbols", () => {
  it("finds exported functions", () => {
    const symbols = extractSymbols([
      { path: "a.ts", content: "export function foo() {}\nexport function bar() {}" },
    ]);
    expect(symbols.sort()).toEqual(["bar", "foo"]);
  });
});

describe("extractReferences", () => {
  it("finds backtick code spans", () => {
    expect(extractReferences("Call `foo` and `bar` here.").sort()).toEqual(["bar", "foo"]);
  });

  it("ignores identifiers with a parenthetical inside the span", () => {
    expect(extractReferences("Call `foo(x)` here.")).toEqual([]);
  });
});
