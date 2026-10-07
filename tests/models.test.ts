import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MODELS } from "@/data/models";
import { createModel } from "@/lib/models";
import { defaults, validate } from "@/lib/validation";

beforeAll(() => {
  vi.stubGlobal("fetch", async (url: string) => ({ ok: true, json: async () => JSON.parse(readFileSync(join(__dirname, "..", "public", url), "utf8")) }));
});

describe.each(MODELS)("experiment: $id", (def) => {
  it("default inputs validate and produce a complete result", async () => {
    expect(validate(def, defaults(def))).toEqual({});
    const r = await createModel(def).predict(defaults(def));
    expect(r.headline.length).toBeGreaterThan(3);
    expect(r.probability).toBeGreaterThanOrEqual(0);
    expect(r.probability).toBeLessThanOrEqual(1);
    expect(r.probabilities.length).toBeGreaterThan(1);
    expect(r.message && r.recommendation).toBeTruthy();
    expect(r.featureImportance.length).toBeGreaterThan(0);
  });
  it("rejects nonsense", () => {
    const f = def.fields.find((x) => x.type === "slider" || x.type === "number")!;
    expect(Object.keys(validate(def, { ...defaults(def), [f.name]: 900000 }))).toContain(f.name);
  });
});

it("battery message is friendly", () => {
  const d = MODELS[0];
  expect(validate(d, { ...defaults(d), battery: 900 }).battery).toMatch(/900% battery/);
});
