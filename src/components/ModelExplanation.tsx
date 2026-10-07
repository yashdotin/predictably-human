"use client";
import { useEffect, useState } from "react";
import { loadMetadata } from "@/lib/inference/loader";
import type { ModelDef, ModelMetadata } from "@/types/model";

const LABEL: Record<string, string> = { accuracy: "Accuracy", roc_auc: "ROC-AUC", oracle_auc: "Oracle AUC (ceiling)", log_loss: "Log-loss", brier: "Brier score", macro_f1: "Macro F1", top3_accuracy: "Top-3 accuracy",
  oracle_accuracy: "Oracle accuracy (ceiling)", markov_baseline_accuracy: "Markov baseline accuracy", mae: "MAE", r2: "R²" };

export function ModelExplanation({ def }: { def: ModelDef }) {
  const [m, setM] = useState<ModelMetadata | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open && !m) loadMetadata(def.id).then(setM).catch(() => setM(null)); }, [open, m, def.id]);
  return (
    <details className="group rounded-2xl border border-line bg-card" onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[15px] font-medium">
        How the model thinks <span aria-hidden className="mono text-muted transition group-open:rotate-45">+</span>
      </summary>
      <div className="space-y-6 border-t border-line px-5 py-5 text-sm">
        {!m ? <p className="text-muted">Loading…</p> : (<>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {[["Version", m.version], ["Date", m.trained_at], ["Random seed", String(m.seed)], ["Rows of data", m.n_samples.toLocaleString()], ["Inputs", String(m.feature_importance.length)], ["Data", "Made up"]].map(([k, v]) =>
              <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="mono mt-0.5">{v}</dd></div>)}
          </dl>
          {Object.entries(m.heads).map(([name, h]) => (
            <div key={name}>
              <p className="font-medium">{h.algorithm} <span className="mono text-xs text-muted">· {name} head · {h.task}</span></p>
              <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
                {Object.entries(h.metrics).map(([k, v]) => <div key={k} className="flex justify-between gap-2 border-b border-line py-1"><dt className="text-muted">{LABEL[k] ?? k}</dt><dd className="mono">{v}</dd></div>)}
              </dl>
            </div>
          ))}
          <div>
            <p className="font-medium">What matters most</p>
            <ol className="mt-2 list-decimal pl-5 text-muted">{m.feature_importance.slice(0, 4).map((f) => <li key={f.feature}><span className="text-ink">{def.fields.find((x) => x.name === f.feature)?.label ?? f.feature}</span> <span className="mono text-xs">({(f.importance * 100).toFixed(0)}%)</span></li>)}</ol>
          </div>
          <div>
            <p className="font-medium">Limitations</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">{m.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
          </div>
          <p className="text-xs text-muted">These numbers are for a fun experiment. Please don't treat it as a real prediction of how people behave.</p>
        </>)}
      </div>
    </details>
  );
}
