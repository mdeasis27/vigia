import { describe, expect, it } from "vitest";
import { STORY } from "./story";
import { lintStory, storyStrings as strings } from "@/design-system/demo/copy-lint";

describe("Vigia story copy", () => {
  it("has the same shape in English and Spanish", () => {
    const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).filter(([k]) => k !== "before" && k !== "after").flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];
    expect(keys(STORY.es)).toEqual(keys(STORY.en));
    expect(STORY.es.analogy.dictionary).toHaveLength(STORY.en.analogy.dictionary.length);
  });

  it("has no empty strings except the owner-supplied why note", () => {
    for (const locale of ["en", "es"] as const) {
      const { why, ...rest } = STORY[locale];
      expect(why.title.trim()).not.toBe("");
      for (const s of strings(rest)) expect(s.trim(), `${locale}: empty string`).not.toBe("");
    }
  });

  it("avoids AI-sounding patterns and brand names", () => {
    for (const locale of ["en", "es"] as const) expect(lintStory(STORY[locale]), locale).toEqual([]);
  });

  it("states the comparison truthfully at zero, one and several left by hand", () => {
    expect(STORY.es.compare.sentence(0, 7, 5)).toBe("El vigía encuentra las 7 referencias rotas, y 5 quedan para que una persona las arregle. Sin él, las 7 se quedan en la documentación hasta que un lector tropieza con una.");
    expect(STORY.en.compare.sentence(0, 7, 1)).toContain("and 1 is left for a person to fix");
    expect(STORY.en.compare.sentence(0, 7, 0)).toContain("and none is left for a person");
    expect(STORY.en.compare.sentence(7, 7, 2)).toBe("Both sides leave 7 broken references unnoticed.");
  });

  it("asks the bet about the renames the visitor chose", () => {
    expect(STORY.en.tryIt.question(1)).toContain("with 1 rename on record");
    expect(STORY.es.tryIt.question(2)).toContain("con 2 cambios de nombre registrados");
    expect([0, 1, 2].map(STORY.es.compare.verdict)).toEqual(["Ninguna referencia queda para arreglar a mano", "1 referencia queda para arreglar a mano", "2 referencias quedan para arreglar a mano"]);
  });
});
