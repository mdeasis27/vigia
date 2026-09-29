"""Detection — mirrors lib/vigia/detect.py."""

from __future__ import annotations

from .extract import extract_references


def _correct(content: str, refs: list[dict]) -> str:
    out = content
    for r in refs:
        if r["corrected"]:
            out = out.replace(f"`{r['symbol']}`", f"`{r['corrected']}`")
    return out


def detect(source_symbols: list[str], renames: dict, docs: list[dict], ground_truth_stale: list[str]) -> dict:
    symbols = set(source_symbols)
    doc_results: list[dict] = []

    references_found = 0
    detected_stale_docs = 0
    stale_references = 0
    auto_corrected = 0

    for doc in docs:
        refs = extract_references(doc["content"])
        references_found += len(refs)
        stale_refs = [
            {"docId": doc["id"], "symbol": r, "corrected": renames[r] if r in renames else None}
            for r in refs
            if r not in symbols
        ]

        stale = len(stale_refs) > 0
        if stale:
            detected_stale_docs += 1
        stale_references += len(stale_refs)
        auto_corrected += sum(1 for r in stale_refs if r["corrected"] is not None)

        doc_results.append({
            "id": doc["id"],
            "path": doc["path"],
            "content": doc["content"],
            "stale": stale,
            "references": refs,
            "staleReferences": stale_refs,
            "correctedContent": _correct(doc["content"], stale_refs) if stale else None,
        })

    gt_set = set(ground_truth_stale)
    detected_ids = [d["id"] for d in doc_results if d["stale"]]
    false_positives = sum(1 for i in detected_ids if i not in gt_set)
    detected_stale_correct = sum(1 for i in detected_ids if i in gt_set)

    return {
        "symbolsExtracted": len(symbols),
        "referencesFound": references_found,
        "staleDocs": len(ground_truth_stale),
        "detectedStaleDocs": detected_stale_docs,
        "detectionRecall": 0.0 if not ground_truth_stale else detected_stale_correct / len(ground_truth_stale),
        "falsePositives": false_positives,
        "staleReferences": stale_references,
        "autoCorrected": auto_corrected,
        "flaggedOnly": stale_references - auto_corrected,
        "autoCorrectionRate": 0.0 if stale_references == 0 else auto_corrected / stale_references,
        "docs": doc_results,
    }
