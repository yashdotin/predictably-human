import type { LinearHead } from "./types";

export function runLinear(h: LinearHead, x: number[]): number | number[] {
  const z = h.coef.map((row, k) => {
    let s = h.intercept[k];
    for (let i = 0; i < row.length; i++) s += ((x[i] - h.mean[i]) / h.scale[i]) * row[i];
    return s;
  });
  if (h.task === "binary") return 1 / (1 + Math.exp(-z[0]));
  const mx = Math.max(...z);
  const e = z.map((v) => Math.exp(v - mx));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / sum);
}
