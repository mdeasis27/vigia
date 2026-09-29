"""Extraction — mirrors lib/vigia/extract.py."""

from __future__ import annotations

import re

SYMBOL_RE = re.compile(r"export\s+function\s+([A-Za-z_][A-Za-z0-9_]*)")
REF_RE = re.compile(r"`([A-Za-z_][A-Za-z0-9_]*)`")


def extract_symbols(source: list[dict]) -> list[str]:
    symbols: set[str] = set()
    for f in source:
        symbols.update(SYMBOL_RE.findall(f["content"]))
    return sorted(symbols)


def extract_references(content: str) -> list[str]:
    return sorted(set(REF_RE.findall(content)))
