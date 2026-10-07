"use client";
import { useId } from "react";
import type { Field, NumberFieldDef, SegmentedField, SelectField, SliderField } from "@/types/model";
import { clamp, cn, formatValue } from "@/lib/utils";

interface P<F extends Field> { field: F; value: number | string; error?: string; onChange: (v: number | string) => void }

function Wrap({ id, field, error, right, children }: { id: string; field: Field; error?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-line last:border-0">
      <div className="flex items-baseline justify-between gap-4 mb-1.5">
        <label htmlFor={id} id={`${id}-label`} className="text-[15px] font-medium">{field.label}</label>
        {right}
      </div>
      {field.help && <p className="text-xs text-muted -mt-0.5 mb-1.5" id={`${id}-help`}>{field.help}</p>}
      {children}
      {error && <p role="alert" className="mt-2 text-sm text-accent fade">{error}</p>}
    </div>
  );
}

const toPos = (v: number, f: SliderField) => (f.log ? (Math.log(clamp(v, f.min, f.max)) - Math.log(f.min)) / (Math.log(f.max) - Math.log(f.min)) : (clamp(v, f.min, f.max) - f.min) / (f.max - f.min));
const fromPos = (p: number, f: SliderField) => {
  const raw = f.log ? Math.exp(Math.log(f.min) + p * (Math.log(f.max) - Math.log(f.min))) : f.min + p * (f.max - f.min);
  const s = f.log ? Math.max(f.step, Math.round(raw / (raw > 60 ? 5 : 1)) * (raw > 60 ? 5 : 1)) : Math.round(raw / f.step) * f.step;
  return +clamp(s, f.min, f.max).toFixed(4);
};

export function SliderControl({ field, value, error, onChange }: P<SliderField>) {
  const id = useId(); const num = Number(value); const ok = Number.isFinite(num);
  const pos = ok ? toPos(num, field) : 0; const editable = !field.format || field.format === "plain";
  return (
    <Wrap id={id} field={field} error={error} right={editable ? (
      <span className="flex items-baseline gap-1 mono text-sm">
        <input aria-labelledby={`${id}-label`} inputMode="decimal" value={ok ? String(value) : String(value)} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className={cn("w-16 text-right bg-transparent border-b border-line focus:border-ink outline-none py-0.5", error && "border-accent text-accent")} />
        <span className="text-muted">{field.unit?.trim()}</span>
      </span>) : <span className="mono text-sm" aria-live="polite">{ok ? formatValue(field.format, num, field.unit) : "-"}</span>}>
      <input id={id} type="range" min={0} max={1000} step={1} value={Math.round(pos * 1000)} aria-describedby={field.help ? `${id}-help` : undefined}
        aria-valuetext={ok ? formatValue(field.format, num, field.unit) : undefined}
        style={{ ["--fill" as string]: `${pos * 100}%` }} onChange={(e) => onChange(fromPos(Number(e.target.value) / 1000, field))} />
    </Wrap>
  );
}

export function NumberControl({ field, value, error, onChange }: P<NumberFieldDef>) {
  const id = useId();
  return (
    <Wrap id={id} field={field} error={error}>
      <input id={id} type="number" inputMode="numeric" min={field.min} max={field.max} step={field.step} value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} aria-invalid={!!error}
        className={cn("mono w-28 rounded-md border bg-card px-3 py-2 text-sm outline-none focus:border-ink", error ? "border-accent" : "border-line")} />
    </Wrap>
  );
}

export function SegmentedControl({ field, value, error, onChange }: P<SegmentedField>) {
  const id = useId();
  return (
    <div className="py-4 border-b border-line last:border-0">
      <p id={`${id}-label`} className="text-[15px] font-medium mb-2">{field.label}</p>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="flex flex-wrap gap-2">
        {field.options.map((o) => {
          const on = String(o.value) === String(value);
          return (
            <label key={String(o.value)} className={cn("cursor-pointer select-none rounded-full border px-3.5 py-1.5 text-sm transition active:scale-[.97] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
              on ? "bg-ink text-paper border-ink" : "bg-card border-line hover:border-ink")}>
              <input type="radio" className="sr-only" name={id} checked={on} onChange={() => onChange(o.value)} />
              {o.emoji && <span aria-hidden className="mr-1.5">{o.emoji}</span>}{o.label}
            </label>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-accent">{error}</p>}
    </div>
  );
}

export function SelectControl({ field, value, error, onChange }: P<SelectField>) {
  const id = useId();
  return (
    <Wrap id={id} field={field} error={error}>
      <select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-ink">
        {field.options.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
    </Wrap>
  );
}
