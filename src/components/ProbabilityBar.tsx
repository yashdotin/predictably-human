"use client";
import { useEffect, useState } from "react";
import { cn, pct } from "@/lib/utils";

export function ProbabilityBar({ label, value, primary, big }: { label: string; value: number; primary?: boolean; big?: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => { const r = requestAnimationFrame(() => setW(value * 100)); return () => cancelAnimationFrame(r); }, [value]);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className={cn(primary ? "font-medium" : "text-muted")}>{label}</span>
        <span className="mono">{pct(value)}</span>
      </div>
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}
        className={cn("w-full overflow-hidden rounded-full bg-line", big ? "h-3" : "h-1.5")}>
        <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", primary ? "bg-accent" : "bg-ink/70")} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}
