import type { ImpactItem } from "@/types/model";
import { cn } from "@/lib/utils";

export function FeatureImpact({ items }: { items: ImpactItem[] }) {
  return (
    <section aria-labelledby="why">
      <h3 id="why" className="text-sm font-medium">Why?</h3>
      <p className="mt-1 text-xs text-muted">How much each answer pushed the result.</p>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {items.map((i) => (
          <li key={i.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="flex items-center gap-2"><span aria-hidden className={cn("mono text-xs", i.direction === "up" ? "text-accent" : "text-muted")}>{i.direction === "up" ? "▲" : "▼"}</span>{i.label}
              <span className="sr-only">{i.direction === "up" ? "pushes toward the prediction" : "pushes against the prediction"}</span></span>
            <span className={cn("mono text-[11px] tracking-wide", i.level === "HIGH" ? "text-accent" : "text-muted")}>{i.level} IMPACT</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
