import type { FormatKind } from "@/types/model";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);
export const pct = (p: number, d = 1) => `${(p * 100).toFixed(d)}%`;
export const argmax = (a: number[]) => a.indexOf(Math.max(...a));

export function fmtDuration(min: number): string {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m}m`;
  if (m < 60 * 24) return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
  return `${Math.floor(m / 1440)}d ${Math.floor((m % 1440) / 60)}h`;
}

export function formatValue(kind: FormatKind | undefined, v: number, unit?: string): string {
  switch (kind) {
    case "clock": {
      const h = Math.floor(v) % 24, m = Math.round((v - Math.floor(v)) * 60) % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    case "hours": return v < 48 ? `${Math.round(v)}h` : `${Math.round(v / 24)} days`;
    case "minutes": return fmtDuration(v);
    default: return `${Number.isInteger(v) ? v : +v.toFixed(2)}${unit ?? ""}`;
  }
}
