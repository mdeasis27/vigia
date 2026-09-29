"""Benchmark — mirrors lib/vigia/benchmark.py."""

from __future__ import annotations

from .detect import detect
from .extract import extract_symbols


def benchmark(snapshot: dict) -> dict:
    symbols = extract_symbols(snapshot["source"])
    return detect(symbols, snapshot["renames"], snapshot["docs"], snapshot["staleDocs"])
