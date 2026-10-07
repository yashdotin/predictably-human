import Link from "next/link";
import type { ModelDef } from "@/types/model";

export function ExperimentCard({ def, algorithm }: { def: ModelDef; algorithm?: string }) {
  return (
    <Link href={`/experiments/${def.id}`} className="group flex h-full flex-col rounded-2xl border border-line bg-card p-6 transition duration-200 hover:-translate-y-0.5 hover:border-ink active:translate-y-0">
      <div className="mono flex items-center justify-between text-xs text-muted"><span>{String(def.index).padStart(2, "0")}</span><span>{def.category}</span></div>
      <h3 className="display mt-6 text-[28px] text-balance">{def.name}</h3>
      <p className="mt-3 text-sm text-muted text-pretty">{def.short}</p>
      <div className="mt-auto pt-8">
        <p className="mono text-[11px] text-muted">{def.fields.length} inputs · {algorithm ?? def.outputType}</p>
        <p className="mt-3 text-sm font-medium">Run experiment <span aria-hidden className="inline-block transition group-hover:translate-x-1">→</span></p>
      </div>
    </Link>
  );
}
