"use client";
import { useEffect, useState } from "react";
import { createModel } from "@/lib/models";
import { getModel } from "@/data/models";
import { pct } from "@/lib/utils";
import type { PredictionResult, RawInput } from "@/types/model";

const INPUT: RawInput = { hour: 23.5, battery: 34, sleep: 5.2, deadline_hours: 24, phone_distance: 0, mood: 0, tabs: 23, last_activity: "scrolling" };

export function HeroCard() {
  const [r, setR] = useState<PredictionResult | null>(null);
  useEffect(() => { const def = getModel("study-vs-instagram")!; createModel(def).predict(INPUT).then(setR).catch(() => setR(null)); }, []);
  const rows: [string, string][] = [["deadline", "tomorrow"], ["sleep", "5.2h"], ["phone", "in hand"], ["last activity", "scrolling"]];
  return (
    <figure aria-label="Example prediction from the Study vs Instagram model" className="rounded-2xl border border-line bg-card p-6 shadow-[0_1px_0_rgba(0,0,0,.03)] sm:p-7">
      <div className="mono space-y-6 text-[13px]">
        <div><p className="text-muted">INPUT</p><ul className="mt-2 space-y-1">{rows.map(([k, v]) => <li key={k}><span className="text-muted">{k}:</span> {v}</li>)}</ul></div>
        <p aria-hidden className="text-muted">↓</p>
        <div><p className="text-muted">MODEL</p><p className="mt-2">HUMAN-001 <span className="text-muted">· {r?.metadata.algorithm ?? "..."}</span></p></div>
        <p aria-hidden className="text-muted">↓</p>
        <div className="min-h-[6.5rem]"><p className="text-muted">PREDICTION</p>
          {r ? <div className="rise"><p className="display mt-2 text-4xl" style={{ fontFamily: "var(--font-display)" }}>{r.headline}</p>
            <p className="mt-2">confidence <span className="text-accent">{pct(r.probability)}</span></p></div> : <p className="mt-2 text-muted">running…</p>}
        </div>
      </div>
    </figure>
  );
}
