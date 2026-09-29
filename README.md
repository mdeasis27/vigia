# Vigia

**Self-healing technical documentation** — extract symbols from code, flag stale references in
docs, and auto-correct renames using the commit diff.

> **Result:** the detector flags **2/2 stale docs (100% recall, 0 false positives)**. Of the 3
> stale references, **2 are auto-corrected** (renames from the diff) and **1 is flagged for
> manual review** (a removal with no rename). The auto-correction rate is **66.7%** — the honest
> ceiling: a removal can't be auto-corrected without a rename.

---

## Result

| Metric | Value |
|---|---|
| Symbols extracted (2 source files) | 3 |
| Doc references found | 5 |
| Stale docs detected | 2 / 2 (100% recall) |
| False positives | 0 |
| Stale references | 3 |
| Auto-corrected (renames) | 2 |
| Flagged for manual review (removal) | 1 |
| Auto-correction rate | 66.7% |

The code renamed `getUserScore` → `getCreditScore` and `getRiskLevel` → `getRiskTier`, and
removed `computeScore`. Docs `d02` and `d03` still reference the old/removed names. The healer
rewrites the two renames and flags the removal.

---

## Architecture

```
lib/vigia/                  # canonical core (TypeScript, tested)
  extract.ts                #   extract `export function` symbols + backtick references
  detect.ts                 #   staleness detection + rename auto-correction
  benchmark.ts              #   detection recall · auto-correction rate · false positives
  demo.ts                   #   wires the snapshot into every number
  data/                     #   snapshot.json (source + docs + renames + ground truth)
  fixtures/                 #   detection.json (pinned metrics)
backend/                    # same math in Python + pytest (authoritative)
  src/vigia/                #   extract.py · detect.py · benchmark.py
  tests/                    #   pinned to tests/fixtures/{snapshot,detection}.json
app/                        # Next.js landing + demo dashboard (Vercel, demo mode)
```

Extraction and detection are deterministic. The rename map is the "diff" a real GitHub Action
would read from the commit — it is the signal that separates an auto-correctable rename from a
flagged removal. Both languages reproduce the pinned metrics exactly.

## Design decisions & tradeoffs

1. **The rename diff is the auto-correction signal.** Detecting staleness is a set-difference
   (`references − symbols`); *correcting* it requires knowing the new name, which only the commit
   diff provides. Removals are flagged, not guessed.
2. **Backtick code spans as the reference grammar.** The demo parses `` `identifier` `` spans —
   a tiny, honest subset of how real docs reference symbols. It deliberately ignores
   `code(id)`-style spans to avoid false positives.
3. **Self-healing is "open a PR", not "rewrite in place".** The demo produces the corrected
   content as the proposed change; production wraps it in a pull request for review.

## What did not work

- **Removals have no deterministic correction.** `computeScore` is stale and no rename exists,
   so the only honest action is to flag it. The 66.7% auto-correction rate reflects that: you
   can auto-fix what the diff explains, and only flag what it can't.
- **The reference grammar is narrower than real docs.** Headings, links, and prose mentions
   aren't parsed; real systems combine backtick spans with prose symbol detection and link
   resolution.

## Run it

```bash
# frontend demo + TS tests
pnpm install && pnpm dev      # http://localhost:3000
pnpm test                     # 6 vitest tests

# backend (authoritative math) — Python 3.12+
cd backend && uv sync --extra dev && uv run pytest   # 4 tests, pinned fixtures
```

## Stack

Next.js 16 · TypeScript · Vitest · Tailwind v4 · Python 3.13 · pytest
