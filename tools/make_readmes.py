import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]; ML = ROOT / "ml"
INFO = {
 "study_vs_instagram": ("01 · Will I study or open Instagram?", "Binary: `study = 1` if the person studies, `0` if they open Instagram.",
   "A hidden discipline trait plus structural effects: more sleep, better mood, a closer deadline and a farther phone raise study odds; late night, many tabs and a just-finished scroll lower them. Two interactions (late night with phone in reach, high mood with a near deadline) and logit noise keep it non-deterministic."),
 "maggi_spice": ("02 · Will this Maggi become too spicy?", "Two heads. `spice` (0 to 100 regression) and `survive` (binary).",
   "Heat grows with masala and chilli, falls with water, saturates toward 100, and is scaled by a hidden spice-tolerance trait. Survival depends on the realised spice, hunger, and noise. Class bands (Safe / Suspicious / Dangerous / Call someone) are fixed thresholds applied in the app."),
 "nap_predictor": ("03 · If I lie down for 5 minutes, will I wake up?", "Two heads. `wake` (binary: nap lasted 30 minutes or less) and `duration` (regression on log-minutes).",
   "Sleepiness combines sleep debt, bed comfort, heat, the post-lunch slump, workload, previous naps, weekend and a hidden trait. Duration is log-normal around that. A nearly dead phone (no alarm) stretches the nap. Risk bands are thresholds on `wake` applied in the app."),
 "next_app": ("04 · Which app will I open next?", "8-class: Instagram, WhatsApp, YouTube, Chrome, Gmail, Spotify, Maps, Notes.",
   "A second/third-order Markov process with hand-set transition tendencies (Instagram and WhatsApp ping-pong, Chrome to Gmail), plus context effects: night boosts Instagram/YouTube, work hours boost Gmail, notifications boost messaging, activity biases, low battery suppresses video and maps. An A-B-A pattern pushes B. Compared with a plain bigram baseline."),
 "bathroom_phone": ("05 · Will I take my phone to the bathroom?", "Binary: `takes_phone`.",
   "Logit from typical time, phone already in hand (the dominant term), boredom, notifications, a small battery effect, late night, an in-hand x bored interaction and a hidden phone-habit trait."),
 "programmer_debug": ("06 · Will this programmer fix the bug or restart the server?", "5-class: fix, restart, google, blame, giveup.",
   "Each strategy has its own utility. Rest, experience and coffee favour a proper fix; long sessions favour restarting and giving up; Stack Overflow tabs favour googling; long errors and experience favour blaming dependencies. Gumbel-style noise is added to utilities before sampling."),
 "will_she_reply": ("07 · Will she reply or am I cooked?", "Two heads. `reply` (binary: replies within 12 hours) and `eta` (regression: wait in minutes, trained only on rows that got a reply).",
   "Entertainment only. Rows are messages with no reply yet. A hidden responsiveness trait shifts both the ghost probability and the delay; seen-without-reply, long gaps relative to her usual speed, night and weekend raise ghosting. No real messages, no real people."),
 "excuse": ("08 · What excuse will I make tomorrow?", "8-class: github, internet, laptop, family, forgot, almost, submitted, other.",
   "Weather drives connectivity excuses, heat drives laptop excuses, strictness drives family and GitHub excuses, low motivation and many unfinished tasks drive 'forgot', few unfinished tasks drive 'almost', lenient teachers invite 'submitted'. The app picks the wording; the model predicts the category."),
}
def tbl(rows, head): return "| " + " | ".join(head) + " |\n|" + "---|" * len(head) + "\n" + "\n".join("| " + " | ".join(map(str, r)) + " |" for r in rows)
summary = []
for d, (title, target, design) in INFO.items():
    meta = json.load(open(ML / d / "model/metadata.json")); model = json.load(open(ML / d / "model/model.json"))
    inputs = [[s["name"], s["kind"] if s["kind"] == "cat" else s.get("enc", "raw") if s.get("enc") != "raw" else "numeric",
               ", ".join(s["values"]) if s["kind"] == "cat" else f'{s["lo"]} to {s["hi"]}'] for s in model["featurizer"]["inputs"]]
    heads = ""
    for h, v in meta["heads"].items():
        heads += f"\n**Head `{h}`: {v['algorithm']}** ({v['task']})\n\n" + tbl([[k, x] for k, x in v["metrics"].items()], ["metric (test set)", "value"]) + "\n"
        if v.get("candidates"): heads += "\nValidation comparison (lower log-loss wins):\n\n" + tbl([[c["model"], round(c["val_log_loss"], 4), round(c["val_accuracy"], 4)] for c in v["candidates"]], ["candidate", "val log-loss", "val accuracy"]) + "\n"
    imp = ", ".join(f"{f['feature']} ({f['importance']*100:.0f}%)" for f in meta["feature_importance"][:5])
    size = (ML / d / "model/model.json").stat().st_size / 1024
    (ML / d / "README.md").write_text(f"""# {title}

> Synthetic data, real models. Entertainment only: these numbers describe an experimental model, not a validated predictor of human behavior.

**Model id:** `{meta['id']}` · **version:** {meta['version']} · **trained:** {meta['trained_at']} · **seed:** {meta['seed']} · **rows:** {meta['n_samples']:,} (train {meta['splits']['train']:,} / val {meta['splits']['val']:,} / test {meta['splits']['test']:,})

## Target
{target}

## Dataset (source: synthetic)
There is no public dataset for this question, so `generate()` in `train.ipynb` builds one. It is reproducible (`seed={meta['seed']}`) and written to `dataset.csv`.

{design}

The generator also knows the *true* probability of every row, which gives an **oracle** score: the ceiling no model can beat, because of hidden traits and noise. Oracle values are reported in the metrics below.

## Inputs
{tbl(inputs, ['input', 'encoding', 'range / values'])}

Encodings are exported in `model.json` (`featurizer.columns`) and used the same way in Python and on the website: `cyc` becomes sin/cos, `log1p` is a log transform, categoricals are one-hot.

## Results
{heads}
**Most important inputs (permutation importance):** {imp}

## Files
| file | purpose |
|---|---|
| `train.ipynb` | Colab-ready notebook: generate, clean, EDA, features, split, train, evaluate, importance, export, verify |
| `dataset.csv` | the generated dataset |
| `model/model.json` | exported model ({size:.0f} KB): featurizer + heads (linear coefficients or flattened trees + calibration) |
| `model/metadata.json` | version, seed, sample counts, metrics, importance, limitations (read by the website's model card) |
| `model/parity_fixtures.json` | 200 raw inputs with the reference outputs; the website tests replay them |

## Retrain
1. Open `train.ipynb` in Colab (upload `../_shared/kit.py` when asked) or locally: `pip install numpy pandas scikit-learn matplotlib scipy`.
2. Run all cells. Artifacts are written to `model/`.
3. From the repo root: `npm run sync:models && npm test` to copy them into the site and re-run parity checks.

## Limitations
{chr(10).join('- ' + l for l in meta['limitations'])}
""")
    summary.append((d, meta))
rows = []
for d, m in summary:
    for h, v in m["heads"].items():
        k = v["metrics"]; main = {"roc_auc": f"AUC {k.get('roc_auc')}", "accuracy": f"acc {k.get('accuracy')}"}
        s = f"acc {k['accuracy']}" + (f" · AUC {k['roc_auc']}" if "roc_auc" in k else "") + (f" · top-3 {k['top3_accuracy']}" if "top3_accuracy" in k else "") if "accuracy" in k else f"MAE {k['mae']} · R² {k['r2']}"
        ceiling = f"AUC {k['oracle_auc']}" if "oracle_auc" in k else (f"acc {k['oracle_accuracy']}" if "oracle_accuracy" in k else "n/a")
        rows.append([f"`{d}`", h, v["algorithm"], f"{m['n_samples']:,}", s, ceiling])
table = tbl(rows, ["folder", "head", "algorithm", "rows", "test metrics", "oracle ceiling"])
(ML / "README.md").write_text(f"""# ML experiments

Each folder is one experiment with its own notebook, dataset, exported model and README.

{table}

Algorithms are chosen *per head* on validation log-loss between a logistic regression and a random forest. On these synthetic datasets (logit-shaped by construction) the linear model usually wins, which is the honest result; regression heads use random forests, and the forest runtime is exercised by those heads and covered by the parity tests.

Shared code lives in `_shared/kit.py` (featurizer, training, evaluation, JSON export, and a pure-Python reference runtime that the website code must match). See `DATASETS.md` for data provenance.
""")
(ML / "DATASETS.md").write_text(f"""# Dataset sources and provenance

All eight datasets are **synthetic**. None contains real people, messages, or usage logs.

| dataset | rows | generator | seed |
|---|---|---|---|
""" + "\n".join(f"| `{d}/dataset.csv` | {m['n_samples']:,} | `generate()` in `{d}/train.ipynb` (source: `tools/notebooks/src/{d}.py`) | {m['seed']} |" for d, m in summary) + """

## How they are built
1. Draw features from realistic distributions (log-normal durations, beta battery levels, Poisson counts, hour-of-day mixtures).
2. Draw a hidden trait per row (discipline, spice tolerance, responsiveness, phone attachment) that the model never sees.
3. Combine features through effects with defensible signs (more sleep helps studying, a closer phone hurts it, and so on), including a few interactions.
4. Add noise and sample the label, so no dataset is deterministic.
5. Keep the true probability to report an **oracle** ceiling next to each model's score.

## Why synthetic
There is no public dataset for "will I take my phone to the bathroom." Synthetic data lets the project be reproducible, privacy-safe and honest about what the metrics mean: they show how well a model recovers the generator, **not** how well it predicts real behavior.

## Privacy
No personal data is collected, uploaded or stored by the dataset code or the website. The reply experiment uses synthetic rows only.

## Regenerating
Run a notebook, or `python tools/notebooks/build_nb.py tools/notebooks/src/<name>.py` to rebuild and execute it, then `python tools/make_readmes.py`.
""")
(ROOT / "tools" / "models_table.md").write_text(table)
print("readmes written")

