import { describe, expect, it } from "vitest";
import { runExperience } from "./adapter";

describe("documentation watch experience", () => {
  it("proposes known renames and keeps unknown removals in review", async () => {
    const result = await runExperience({ sourceText: "export function newName() {}", docsText: "Use `oldName` and `removedName`.", renamesText: "oldName:newName" });
    expect(result.result.proposedCorrections).toContain("oldName → newName");
    expect(result.result.needsReview).toContain("removedName");
  });
});
