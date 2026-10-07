import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ModelMetadata } from "@/types/model";
import { MODELS } from "@/data/models";

export function readMetadata(id: string): ModelMetadata | null {
  try { return JSON.parse(readFileSync(join(process.cwd(), "public", "models", id, "metadata.json"), "utf8")); }
  catch { return null; }
}

export function wallStats() {
  const metas = MODELS.map((m) => readMetadata(m.id)).filter((m): m is ModelMetadata => !!m);
  return { models: metas.length, rows: metas.reduce((a, m) => a + m.n_samples, 0) };
}
