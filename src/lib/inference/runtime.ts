import { runForest } from "./forest";
import { runLinear } from "./linear";
import { vectorize } from "./transforms";
import type { Head, ModelFile, Outputs, RawInput } from "./types";

export function runHead(h: Head, x: number[]): number | number[] {
  return h.kind === "linear" ? runLinear(h, x) : runForest(h, x);
}

export function runModel(model: ModelFile, raw: RawInput): Outputs {
  const x = vectorize(model.featurizer, raw);
  const out: Outputs = {};
  for (const [name, head] of Object.entries(model.heads)) out[name] = runHead(head, x);
  return out;
}
