"""Per-reference outcomes for a partial rename notice. Mirrors lib/vigia/outcomes.ts."""

from __future__ import annotations

from .extract import extract_references, extract_symbols


def reference_outcomes(snapshot: dict, known_renames: int | None = None) -> list[dict]:
    names = list(snapshot["renames"].keys())
    if known_renames is None:
        known_renames = len(names)
    if not isinstance(known_renames, int) or known_renames < 0 or known_renames > len(names):
        raise ValueError(f"known_renames must be 0 to {len(names)}.")
    symbols = set(extract_symbols(snapshot["source"]))
    known = set(names[:known_renames])
    out: list[dict] = []
    for doc in snapshot["docs"]:
        for symbol in extract_references(doc["content"]):
            status = "served" if symbol in symbols else "rerouted" if symbol in known else "lost"
            out.append({"docId": doc["id"], "symbol": symbol, "status": status})
    return out
