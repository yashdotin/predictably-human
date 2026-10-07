"use client";
import type { ModelDef, RawInput } from "@/types/model";
import { NumberControl, SegmentedControl, SelectControl, SliderControl } from "./controls/Controls";

interface Props { def: ModelDef; values: RawInput; errors: Record<string, string>; busy: boolean; onChange: (name: string, v: number | string) => void; onSubmit: () => void; onReset: () => void }

export function PredictionForm({ def, values, errors, busy, onChange, onSubmit, onReset }: Props) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} noValidate aria-label={`Inputs for ${def.name}`}>
      <div className="rounded-2xl border border-line bg-card px-5 sm:px-6">
        {def.fields.map((f) => {
          const common = { value: values[f.name], error: errors[f.name], onChange: (v: number | string) => onChange(f.name, v) };
          switch (f.type) {
            case "slider": return <SliderControl key={f.name} field={f} {...common} />;
            case "number": return <NumberControl key={f.name} field={f} {...common} />;
            case "segmented": return <SegmentedControl key={f.name} field={f} {...common} />;
            default: return <SelectControl key={f.name} field={f} {...common} />;
          }
        })}
      </div>
      <div className="mt-5 flex items-center gap-4">
        <button type="submit" disabled={busy} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-accent active:scale-[.97] disabled:opacity-60">
          {busy ? "Running…" : "Run prediction"}
        </button>
        <button type="button" onClick={onReset} className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">Reset</button>
      </div>
      <p className="mt-4 text-xs text-muted">Nothing you enter is saved.</p>
    </form>
  );
}
