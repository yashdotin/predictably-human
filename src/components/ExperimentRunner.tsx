"use client";
import { useMemo, useRef, useState } from "react";
import type { ModelDef, PredictionResult as Result, RawInput } from "@/types/model";
import { createModel } from "@/lib/models";
import { defaults, validate } from "@/lib/validation";
import { usePrefersReducedMotion } from "@/hooks/useMotion";
import { ModelExplanation } from "./ModelExplanation";
import { PredictionForm } from "./PredictionForm";
import { RunSteps, PredictionResult } from "./PredictionResult";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ExperimentRunner({ def }: { def: ModelDef }) {
  const model = useMemo(() => createModel(def), [def]);
  const reduced = usePrefersReducedMotion();
  const [values, setValues] = useState<RawInput>(() => defaults(def));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [step, setStep] = useState(-1);
  const [failed, setFailed] = useState<string | null>(null);
  const out = useRef<HTMLDivElement>(null);
  const busy = step >= 0 && step < 3;

  async function run() {
    const errs = validate(def, values); setErrors(errs);
    if (Object.keys(errs).length) return;
    setFailed(null); setResult(null);
    try {
      const pending = model.predict(values); const gap = reduced ? 0 : 200;
      for (let i = 0; i < 3; i++) { setStep(i); await sleep(gap); }
      const r = await pending; setResult(r); setStep(3);
      if (window.innerWidth < 1024) out.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    } catch (e) { setStep(-1); setFailed(e instanceof Error ? e.message : "Something went wrong."); }
  }

  return (
    <div className="mt-10 space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
        <PredictionForm def={def} values={values} errors={errors} busy={busy}
          onChange={(k, v) => { setValues((s) => ({ ...s, [k]: v })); if (errors[k]) setErrors(({ [k]: _, ...rest }) => rest); }}
          onSubmit={run} onReset={() => { setValues(defaults(def)); setErrors({}); setResult(null); setStep(-1); }} />
        <div ref={out} className="min-h-[24rem] scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          {failed ? <p role="alert" className="text-sm text-accent">{failed}</p>
            : busy ? <RunSteps step={step} />
            : result ? <PredictionResult r={result} disclaimer={def.disclaimer} />
            : <div className="rounded-2xl border border-dashed border-line p-8 text-sm text-muted"><p className="display text-3xl text-ink">Nothing yet.</p><p className="mt-3 max-w-sm">Fill in the details and press <span className="text-ink">Run prediction</span>.</p></div>}
        </div>
      </div>
      <ModelExplanation def={def} />
    </div>
  );
}
