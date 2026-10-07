import type { ModelMetadata } from "@/types/model";
import type { ModelFile } from "./types";

const cache = new Map<string, Promise<unknown>>();

function fetchOnce<T>(url: string): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`Could not load ${url} (${r.status})`);
      return r.json() as Promise<T>;
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}

export const loadModel = (id: string) => fetchOnce<ModelFile>(`/models/${id}/model.json`);
export const loadMetadata = (id: string) => fetchOnce<ModelMetadata>(`/models/${id}/metadata.json`);
