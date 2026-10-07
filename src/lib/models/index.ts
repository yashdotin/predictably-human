import { loadMetadata, loadModel } from "@/lib/inference/loader";
import { occlusion } from "@/lib/inference/explain";
import { runModel } from "@/lib/inference/runtime";
import { seedOf } from "@/lib/humor";
import { INTERPRETERS } from "./interpreters";
import type { ImpactItem, ModelDef, PredictionModel, PredictionResult, RawInput } from "@/types/model";

export function createModel(def: ModelDef): PredictionModel {
  const it = INTERPRETERS[def.id];
  return {
    id: def.id,
    async predict(input: RawInput): Promise<PredictionResult> {
      const [model, meta] = await Promise.all([loadModel(def.id), loadMetadata(def.id)]);
      const out = runModel(model, input);
      const classes = Object.fromEntries(Object.entries(model.heads).map(([k, h]) => [k, h.classes]));
      const built = it.build(out, seedOf(input), { classes });

      const raw = occlusion(model, input, (o) => it.score(o, out));
      const total = raw.reduce((a, r) => a + Math.abs(r.delta), 0) || 1;
      const labels = Object.fromEntries(def.fields.map((f) => [f.name, f.label]));
      const featureImportance: ImpactItem[] = raw
        .map((r) => ({ name: r.name, label: labels[r.name] ?? r.name, share: Math.abs(r.delta) / total, direction: (r.delta >= 0 ? "up" : "down") as "up" | "down" }))
        .sort((a, b) => b.share - a.share).slice(0, 4)
        .map((r) => ({ ...r, level: (r.share >= 0.3 ? "HIGH" : r.share >= 0.12 ? "MEDIUM" : "LOW") as ImpactItem["level"] }));

      const head = meta.heads[def.primaryHead];
      return { ...built, featureImportance, metadata: { modelId: def.id, version: meta.version, algorithm: head.algorithm, trainedAt: meta.trained_at } };
    },
  };
}
