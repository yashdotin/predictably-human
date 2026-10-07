import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runModel } from "@/lib/inference/runtime";
import type { ModelFile } from "@/lib/inference/types";

const root = join(__dirname, "..");
const slugs = readdirSync(join(root, "public", "models"));

describe.each(slugs)("parity: %s", (slug) => {
  const model: ModelFile = JSON.parse(readFileSync(join(root, "public/models", slug, "model.json"), "utf8"));
  const fixtures: { input: Record<string, number | string>; output: Record<string, number | number[]> }[] =
    JSON.parse(readFileSync(join(root, "tests/fixtures", `${slug}.json`), "utf8"));
  it(`matches ${fixtures.length} Python predictions`, () => {
    for (const f of fixtures) {
      const got = runModel(model, f.input);
      for (const [head, want] of Object.entries(f.output)) {
        const g = got[head];
        if (Array.isArray(want)) want.forEach((w, i) => expect(Math.abs((g as number[])[i] - w)).toBeLessThan(1e-6));
        else expect(Math.abs((g as number) - want) / Math.max(1, Math.abs(want))).toBeLessThan(1e-6);
      }
    }
  });
});
