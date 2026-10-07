import { runModel } from "./runtime";
import type { ModelFile, Outputs, RawInput } from "./types";

export function occlusion(model: ModelFile, raw: RawInput, score: (o: Outputs) => number) {
  const base = score(runModel(model, raw));
  return model.featurizer.inputs.map((s) => {
    const alt = runModel(model, { ...raw, [s.name]: model.featurizer.baseline[s.name] });
    return { name: s.name, delta: base - score(alt) };
  });
}
