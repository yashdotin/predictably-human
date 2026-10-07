"use client";
import type { PredictionResult as Result } from "@/types/model";
import { useCountUp } from "@/hooks/useMotion";
import { cn } from "@/lib/utils";
import { FeatureImpact } from "./FeatureImpact";
import { ProbabilityBar } from "./ProbabilityBar";

const LEVEL = { low: "bg-ink/5 text-ink", mid: "bg-ink/10 text-ink", high: "bg-accent-soft text-accent", extreme: "bg-accent text-white" } as const;

export function RunSteps({ step }: { step: number }) {
  const steps = ["Getting inputs ready…", "Doing the maths…", "Asking the model…", "Done."];
  return (
    <div role="status" aria-live="polite" className="mono space-y-1.5 text-sm text-muted">
      {steps.slice(0, step + 1).map((s, i) => <p key={s} className={cn("fade", i === step && "text-ink")}>{i < step ? "✓ " : "› "}{s}</p>)}
    </div>
  );
}

export function PredictionResult({ r, disclaimer }: { r: Result; disclaimer?: string }) {
  const shown = useCountUp(r.probability * 100);
  return (
    <div className="rise space-y-8" aria-live="polite">
      <div>
        <p className="mono text-xs text-muted">PREDICTION</p>
        <h2 className="display mt-2 text-4xl sm:text-5xl text-balance">{r.headline}</h2>
        {r.badge && <span className={cn("mono mt-4 inline-block rounded-full px-3 py-1 text-xs", LEVEL[r.badge.level])}>{r.badge.label}</span>}
      </div>
      <div>
        <p className="text-sm text-muted">{r.probabilityLabel}</p>
        <p className="display mono text-6xl sm:text-7xl text-accent" style={{ fontFamily: "var(--font-display)" }}>{shown.toFixed(1)}<span className="text-3xl">%</span></p>
      </div>
      <div className="space-y-3.5">
        {r.probabilities.map((p) => <ProbabilityBar key={p.label} label={p.label} value={p.value} primary={p.value === Math.max(...r.probabilities.map((x) => x.value))} big />)}
      </div>
      {r.stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
          {r.stats.map((s) => <div key={s.label} className="bg-card p-4"><dt className="text-xs text-muted">{s.label}</dt><dd className="mono mt-1 text-lg">{s.value}</dd></div>)}
        </dl>
      )}
      <div className="space-y-4 border-l-2 border-accent pl-4">
        <div><p className="mono text-xs text-muted">VERDICT</p><p className="display mt-1 text-2xl">{r.message}</p></div>
        <p className="text-[15px]">{r.recommendation}</p>
      </div>
      <FeatureImpact items={r.featureImportance} />
      <p className="mono text-[11px] text-muted">{r.metadata.algorithm} · {r.metadata.version}</p>
      {disclaimer && <p className="text-xs text-muted">{disclaimer}</p>}
    </div>
  );
}
