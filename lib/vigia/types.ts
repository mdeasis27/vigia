// lib/vigia/types.ts
// Core data shapes for the self-healing docs demo. Plain JSON-serializable
// shapes mirrored one-to-one in backend/src/vigia/types.py.

export interface SourceFile {
  path: string;
  content: string;
}

export interface DocFile {
  id: string;
  path: string;
  content: string;
}

export interface Snapshot {
  source: SourceFile[];
  renames: Record<string, string>;
  docs: DocFile[];
  staleDocs: string[];
}

export interface StaleReference {
  docId: string;
  symbol: string;
  corrected: string | null;
}

export interface DocResult {
  id: string;
  path: string;
  content: string;
  stale: boolean;
  references: string[];
  staleReferences: StaleReference[];
  correctedContent: string | null;
}

export interface DetectionResult {
  symbolsExtracted: number;
  referencesFound: number;
  staleDocs: number;
  detectedStaleDocs: number;
  detectionRecall: number;
  falsePositives: number;
  staleReferences: number;
  autoCorrected: number;
  flaggedOnly: number;
  autoCorrectionRate: number;
  docs: DocResult[];
}
