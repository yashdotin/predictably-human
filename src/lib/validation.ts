import type { ModelDef, RawInput } from "@/types/model";

export function validate(def: ModelDef, values: RawInput): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of def.fields) {
    const v = values[f.name];
    if (f.type === "slider" || f.type === "number") {
      const n = Number(v);
      if (typeof v === "string" && v.trim() === "") errors[f.name] = f.invalid ?? `${f.label}: type a number between ${f.min} and ${f.max}.`;
      else if (!Number.isFinite(n) || n < f.min || n > f.max) errors[f.name] = f.invalid ?? `${f.label} should be between ${f.min} and ${f.max}.`;
    } else if (!f.options.some((o) => String(o.value) === String(v))) errors[f.name] = `Pick one of the options for "${f.label}".`;
  }
  return errors;
}

export function defaults(def: ModelDef): RawInput {
  return Object.fromEntries(def.fields.map((f) => [f.name, f.default]));
}
