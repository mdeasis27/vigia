"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { StatusBadge } from "@/design-system/components/status-badge";

interface StaleRef {
  docId: string;
  symbol: string;
  corrected: string | null;
}

interface DocResult {
  id: string;
  path: string;
  content: string;
  stale: boolean;
  references: string[];
  staleReferences: StaleRef[];
  correctedContent: string | null;
}

interface ScanResponse {
  symbols?: string[];
  symbolsExtracted?: number;
  detectedStaleDocs?: number;
  autoCorrected?: number;
  docs?: DocResult[];
  error?: string;
}

interface HistoryItem {
  id: number;
  symbols: number;
  stale_docs: number;
  auto_corrected: number;
  created_at: string;
}

const SOURCE_PREFILL = `export function getCreditScore(user) { return user.score; }
export function getRiskTier(user) { return user.tier; }`;

const DOCS_PREFILL = `Call \`getUserScore\` to compute the score.
Use \`getCreditScore\` and \`getRiskTier\`.`;

export default function AppPage() {
  const [sourceText, setSourceText] = useState(SOURCE_PREFILL);
  const [docsText, setDocsText] = useState(DOCS_PREFILL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: sourceText, docs: docsText }),
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) loadHistory();
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Error de red" });
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.scans ?? []);
      }
    } catch {
      /* history is best-effort */
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const symbols = result?.symbols ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Inicio
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-tight">Vigia</h1>
                <p className="text-xs text-muted-foreground">Documentación self-healing con base de datos real</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="success" dot className="px-3 py-1">Postgres en vivo</StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Detecta referencias obsoletas en los docs</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Extrae símbolos del código fuente, escanea los docs en busca de referencias en backticks
            y marca stale los símbolos que ya no existen. Un rename conocido (getUserScore →
            getCreditScore) se autocorrige; el resultado se <strong>persiste en Postgres</strong>.
          </p>
        </div>

        {/* ── PLAYGROUND ──────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Código fuente</p>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={6}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Docs (una línea por doc)</p>
            <textarea
              value={docsText}
              onChange={(e) => setDocsText(e.target.value)}
              rows={6}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
          </Card>
        </div>

        <Card className="p-4">
          <button
            onClick={run}
            disabled={loading}
            className="w-full rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Detectando…" : "Detectar stale"}
          </button>
        </Card>

        {result && (
          <div className="space-y-4">
            {result.error && <Alert tone="danger" title="No se pudo escanear">{result.error}</Alert>}

            {!result.error && (
              <div className="space-y-5">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Símbolos extraídos ({symbols.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {symbols.map((s) => (
                      <span key={s} className="rounded-full border border-info/25 bg-info/10 px-2.5 py-0.5 font-mono text-xs text-info">
                        {s}
                      </span>
                    ))}
                  </div>
                </Card>

                <div className="space-y-4">
                  {(result.docs ?? []).map((d) => (
                    <Card key={d.id} className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">{d.id} · {d.path}</p>
                          <h3 className="font-semibold text-foreground mt-0.5">
                            {d.stale ? "Referencias obsoletas" : "Al día"}
                          </h3>
                        </div>
                        {d.stale ? (
                          <StatusBadge tone="warning" dot>stale</StatusBadge>
                        ) : (
                          <StatusBadge tone="success" dot>ok</StatusBadge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{d.content}</p>
                      {d.stale && (
                        <div className="space-y-2">
                          {d.staleReferences.map((r, i) => (
                            <div key={i} className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono text-danger">{r.symbol}</span>
                              {r.corrected ? (
                                <>
                                  <span className="text-muted-foreground">→ autocorregido a</span>
                                  <span className="font-mono text-success">{r.corrected}</span>
                                </>
                              ) : (
                                <StatusBadge tone="danger">eliminado · revisión manual</StatusBadge>
                              )}
                            </div>
                          ))}
                          <div className="rounded-[var(--radius-md)] bg-muted/30 px-3 py-2 mt-2">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Doc corregido</p>
                            <p className="font-mono text-sm text-foreground">{d.correctedContent}</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ─────────────────────────── */}
        {history.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Historial de scans (persistido en Postgres)</h3>
            <div className="overflow-x-auto rounded-[var(--radius-md)] shadow-[var(--shadow-card)] bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--gray-50)]">
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Símbolos</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Docs stale</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Autocorregidos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{h.symbols}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{h.stale_docs}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{h.auto_corrected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
