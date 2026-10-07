import type { FeaturizerSpec, RawInput } from "./types";

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

export function vectorize(fz: FeaturizerSpec, raw: RawInput): number[] {
  return fz.columns.map((c) => {
    const x = raw[c.src];
    switch (c.op) {
      case "onehot": return x === c.value ? 1 : 0;
      case "num": return clamp(Number(x), c.lo as number, c.hi as number);
      case "log1p": return Math.log1p(clamp(Number(x), c.lo as number, c.hi as number));
      case "sin": return Math.sin((2 * Math.PI * Number(x)) / (c.period as number));
      default: return Math.cos((2 * Math.PI * Number(x)) / (c.period as number));
    }
  });
}
