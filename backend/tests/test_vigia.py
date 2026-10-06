import json
from pathlib import Path

import pytest

from vigia.benchmark import benchmark
from vigia.extract import extract_references, extract_symbols

FIXTURES = Path(__file__).parent / "fixtures"


def _load(name: str):
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def test_extract_symbols():
    symbols = extract_symbols([{"path": "a.ts", "content": "export function foo() {}\nexport function bar() {}"}])
    assert sorted(symbols) == ["bar", "foo"]


def test_extract_references():
    assert sorted(extract_references("Call `foo` and `bar` here.")) == ["bar", "foo"]
    assert extract_references("Call `foo(x)` here.") == []


def test_detection_matches_fixture():
    snapshot = _load("snapshot.json")
    fixture = _load("detection.json")

    result = benchmark(snapshot)
    assert result["symbolsExtracted"] == fixture["symbolsExtracted"]
    assert result["referencesFound"] == fixture["referencesFound"]
    assert result["staleDocs"] == fixture["staleDocs"]
    assert result["detectedStaleDocs"] == fixture["detectedStaleDocs"]
    assert result["detectionRecall"] == pytest.approx(fixture["detectionRecall"], abs=1e-12)
    assert result["falsePositives"] == fixture["falsePositives"]
    assert result["staleReferences"] == fixture["staleReferences"]
    assert result["autoCorrected"] == fixture["autoCorrected"]
    assert result["flaggedOnly"] == fixture["flaggedOnly"]
    assert result["autoCorrectionRate"] == pytest.approx(fixture["autoCorrectionRate"], abs=1e-12)


def test_flags_stale_docs_and_corrects_renames():
    snapshot = _load("snapshot.json")
    result = benchmark(snapshot)
    stale_ids = [d["id"] for d in result["docs"] if d["stale"]]
    assert stale_ids == ["d02", "d03", "d05", "d07", "d09", "d11"]

    d02 = next(d for d in result["docs"] if d["id"] == "d02")
    d03 = next(d for d in result["docs"] if d["id"] == "d03")
    assert d02["staleReferences"][0]["corrected"] == "getCreditScore"
    assert "`getCreditScore`" in d02["correctedContent"]
    assert next(r for r in d03["staleReferences"] if r["symbol"] == "computeScore")["corrected"] is None


def test_reference_outcomes_match_fixture():
    from vigia.outcomes import reference_outcomes

    snapshot = _load("snapshot.json")
    for k, expected in _load("outcomes.json")["outcomes"].items():
        assert reference_outcomes(snapshot, int(k)) == expected
    assert reference_outcomes(snapshot, None) == _load("outcomes.json")["outcomes"]["5"]
