"use client";

import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { StatusBadge } from "@/design-system/components/status-badge";
import { getRenames, getResult, getSymbols } from "@/lib/vigia/demo";

const RESULT = getResult();
const SYMBOLS = getSymbols();
const RENAMES = getRenames();

function pct(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export default function AppPage() {
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
                <p className="text-xs text-muted-foreground">Documentación self-healing</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="info" dot className="px-3 py-1">
              Demo mode
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* ── SUMMARY BAR ─────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard
            label="Detección de stale"
            value={pct(RESULT.detectionRecall)}
            hint={`${RESULT.detectedStaleDocs}/${RESULT.staleDocs} docs`}
            tone="success"
          />
          <MetricCard
            label="Autocorrección"
            value={pct(RESULT.autoCorrectionRate)}
            hint={`${RESULT.autoCorrected}/${RESULT.staleReferences} referencias`}
            tone="info"
          />
          <MetricCard
            label="Falsos positivos"
            value={RESULT.falsePositives}
            hint="docs limpios marcados"
            tone="success"
          />
          <MetricCard
            label="Símbolos extraídos"
            value={RESULT.symbolsExtracted}
            hint="de 2 archivos fuente"
            tone="neutral"
          />
        </div>

        {/* ── SYMBOLS + RENAMES ──────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Snapshot del repo</h2>
          <p className="text-sm text-muted-foreground mb-5">
            El código exporta {SYMBOLS.length} símbolos. El diff renombró dos de ellos; los docs
            aún referencian los nombres viejos.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Símbolos actuales</p>
              <div className="flex flex-wrap gap-1.5">
                {SYMBOLS.map((s) => (
                  <span key={s} className="rounded-full border border-info/25 bg-info/10 px-2.5 py-0.5 font-mono text-xs text-info">{s}</span>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Renames del diff</p>
              <div className="space-y-1.5">
                {Object.entries(RENAMES).map(([old, next]) => (
                  <p key={old} className="font-mono text-xs text-foreground">
                    {old} <span className="text-muted-foreground">→</span> <span className="text-success">{next}</span>
                  </p>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* ── DOCS ───────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Docs y su estado</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Cada doc se marca stale si referencia un símbolo que ya no existe. Los renames se
            autocorrigen; las eliminaciones se marcan para revisión humana.
          </p>
          <div className="space-y-4">
            {RESULT.docs.map((d) => (
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
        </section>

        {/* ── NOTE ───────────────────────────── */}
        <section>
          <Alert tone="info" title="El diff de rename es la señal que permite autocorregir">
            Detectar que una referencia es stale es un set-difference; corregirla requiere saber el
            nombre nuevo, y eso solo lo da el diff del commit. Por eso las eliminaciones se marcan
            para humano: sin rename en el diff, no hay una corrección determinista que ofrecer.
          </Alert>
        </section>

        <footer className="pt-8 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
          <span>Vigia · Documentación self-healing · Demo mode</span>
          <a href="https://github.com/mdeasis27/vigia" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors font-mono">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
