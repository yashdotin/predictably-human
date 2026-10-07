import { interp } from "./calibrate";
import type { ForestHead } from "./types";

export function runForest(h: ForestHead, x: number[]): number | number[] {
  const n = h.trees.length;
  let scalar = 0;
  let vec: number[] | null = null;
  for (const tr of h.trees) {
    let i = 0;
    while (tr.f[i] >= 0) i = Math.fround(x[tr.f[i]]) <= tr.t[i] ? tr.l[i] : tr.r[i];
    const v = tr.v[tr.l[i]];
    if (Array.isArray(v)) {
      if (!vec) vec = new Array<number>(v.length).fill(0);
      for (let k = 0; k < v.length; k++) vec[k] += v[k];
    } else scalar += v;
  }
  if (vec) {
    const mean = vec.map((q) => q / n);
    const s = mean.reduce((a, b) => a + b, 0);
    return mean.map((q) => q / s);
  }
  const mean = scalar / n;
  if (h.task === "regression") return h.target === "log" ? Math.exp(mean) : mean;
  return h.calibration ? interp(mean, h.calibration.x, h.calibration.y) : mean;
}
