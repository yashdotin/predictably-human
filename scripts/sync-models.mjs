import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAP = {
  study_vs_instagram: "study-vs-instagram", maggi_spice: "maggi", nap_predictor: "nap", next_app: "next-app",
  bathroom_phone: "bathroom-phone", programmer_debug: "programmer-debug", will_she_reply: "reply", excuse: "excuse",
};
if (!existsSync(join(root, "ml"))) { console.log("sync-models: no ml/ folder, keeping committed public/models"); process.exit(0); }
let n = 0;
for (const [dir, slug] of Object.entries(MAP)) {
  const src = join(root, "ml", dir, "model");
  if (!existsSync(join(src, "model.json"))) { console.warn(`sync-models: missing ${dir}/model/model.json (train it first)`); continue; }
  const out = join(root, "public", "models", slug); mkdirSync(out, { recursive: true });
  cpSync(join(src, "model.json"), join(out, "model.json")); cpSync(join(src, "metadata.json"), join(out, "metadata.json"));
  mkdirSync(join(root, "tests", "fixtures"), { recursive: true });
  cpSync(join(src, "parity_fixtures.json"), join(root, "tests", "fixtures", `${slug}.json`)); n++;
}
console.log(`sync-models: synced ${n}/${Object.keys(MAP).length} models`);
