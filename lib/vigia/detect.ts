// lib/vigia/detect.ts
// Staleness detection + auto-correction. A doc is stale when it references a
// symbol that no longer exists in source. If the missing symbol appears in the
// rename map, the healer auto-corrects it (string replacement); otherwise it is
// flagged for manual review (a removal). Mirrors backend/src/vigia/detect.py.

import { extractReferences } from "./extract";
import type { DetectionResult, DocFile, StaleReference } from "./types";

function correct(content: string, refs: readonly StaleReference[]): string {
  let out = content;
  for (const r of refs) {
    if (r.corrected) out = out.replace(`\`${r.symbol}\``, `\`${r.corrected}\``);
  }
  return out;
}

export function detect(
  sourceSymbols: readonly string[],
  renames: Record<string, string>,
  docs: readonly DocFile[],
  groundTruthStale: readonly string[],
): DetectionResult {
  const symbols = new Set(sourceSymbols);
  const docResults: DetectionResult["docs"] = [];

  let referencesFound = 0;
  let detectedStaleDocs = 0;
  let staleReferences = 0;
  let autoCorrected = 0;

  for (const doc of docs) {
    const refs = extractReferences(doc.content);
    referencesFound += refs.length;
    const staleRefs: StaleReference[] = refs
      .filter((r) => !symbols.has(r))
      .map((r) => ({
        docId: doc.id,
        symbol: r,
        corrected: r in renames ? renames[r] : null,
      }));

    const stale = staleRefs.length > 0;
    if (stale) detectedStaleDocs++;
    staleReferences += staleRefs.length;
    autoCorrected += staleRefs.filter((r) => r.corrected !== null).length;

    docResults.push({
      id: doc.id,
      path: doc.path,
      content: doc.content,
      stale,
      references: refs,
      staleReferences: staleRefs,
      correctedContent: stale ? correct(doc.content, staleRefs) : null,
    });
  }

  const gtSet = new Set(groundTruthStale);
  const detectedIds = docResults.filter((d) => d.stale).map((d) => d.id);
  const falsePositives = detectedIds.filter((id) => !gtSet.has(id)).length;
  const detectedStaleCorrect = detectedIds.filter((id) => gtSet.has(id)).length;

  return {
    symbolsExtracted: symbols.size,
    referencesFound,
    staleDocs: groundTruthStale.length,
    detectedStaleDocs,
    detectionRecall: groundTruthStale.length === 0 ? 0 : detectedStaleCorrect / groundTruthStale.length,
    falsePositives,
    staleReferences,
    autoCorrected,
    flaggedOnly: staleReferences - autoCorrected,
    autoCorrectionRate: staleReferences === 0 ? 0 : autoCorrected / staleReferences,
    docs: docResults,
  };
}
