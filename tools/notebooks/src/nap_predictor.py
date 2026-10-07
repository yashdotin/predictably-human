# %% [markdown]
# # Model 03 · If I lie down for 5 minutes, will I wake up?
# Two heads: log-duration regression (how long the "5 minutes" really lasts) and a classifier for waking within 30 minutes.
# %%
import sys
sys.path.insert(0, "../_shared")
try:
    import kit
except ImportError:
    from google.colab import files; files.upload(); import kit
from kit import *

# %% [markdown]
# ## 1 · Dataset generator
# Sleepiness is a sum of defendable effects (sleep debt, comfort, heat, post-lunch slump, workload, weekend) plus a hidden trait.
# Duration is log-normal. A near-dead phone means no alarm, which stretches the nap.
# %%
DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
def generate(n=10000, seed=SEED):
    r = np.random.default_rng(seed)
    hour = np.where(r.random(n) < .75, r.uniform(12, 19, n), r.uniform(19, 26, n) % 24)
    d = pd.DataFrame({"hour": np.round(hour, 1), "sleep_last": np.round(np.clip(r.normal(6.4, 1.4, n), 2, 10), 1),
        "bed_comfort": r.choice([1, 2, 3, 4, 5], n, p=[.05, .15, .3, .3, .2]), "temp_c": np.round(np.clip(r.normal(29, 5, n), 15, 42)),
        "day": r.choice(DAYS, n), "prev_naps": np.clip(r.poisson(1.2, n), 0, 5), "workload": r.integers(0, 11, n),
        "battery": np.round(np.clip(r.beta(2.2, 1.6, n) * 100, 1, 100))})
    hidden = r.normal(0, 1, n); weekend = d.day.isin(["sat", "sun"]).astype(float)
    drowsy = (0.55 * (8 - d.sleep_last).clip(0) + 0.30 * (d.bed_comfort - 3) + 0.06 * (d.temp_c - 28) + 0.5 * ((d.hour >= 13) & (d.hour < 16))
              + 0.04 * d.workload + 0.2 * d.prev_naps + 0.4 * weekend + 0.5 * hidden + 0.12 * (d.bed_comfort - 3) * (d.sleep_last < 5.5))
    dur = np.exp(np.log(9) + 0.55 * drowsy + r.normal(0, 0.45, n)) * np.where(d.battery < 8, 1.5, 1.0)
    d["duration_min"] = np.round(np.clip(dur, 3, 480), 1); d["wakes_on_time"] = (d.duration_min <= 30).astype(int)
    from scipy.stats import norm
    d["p_true"] = norm.cdf((np.log(30) - np.log(9) - 0.55 * drowsy) / 0.45)
    return d
# %%
df = generate(10000); df.drop(columns="p_true").to_csv("dataset.csv", index=False)
print(df.shape, "| wakes on time:", round(df.wakes_on_time.mean(), 3), "| median nap (min):", df.duration_min.median()); df.drop(columns="p_true").head()
# %% [markdown]
# ## 2 · Cleaning + EDA
# %%
print("nulls:", int(df.isna().sum().sum()), "| duplicates:", int(df.duplicated().sum()))
INPUTS = [Num("hour", 0, 24, "cyc"), Num("sleep_last", 0, 12), Num("bed_comfort", 1, 5), Num("temp_c", 10, 45), Cat("day", DAYS),
          Num("prev_naps", 0, 5), Num("workload", 0, 10), Num("battery", 0, 100)]
RAW = [s["name"] for s in INPUTS]; eda(df, "duration_min", RAW, "regression"); eda(df, "wakes_on_time", RAW)
# %% [markdown]
# ## 3 · Features, split, train both heads
# %%
fz = Featurizer(INPUTS); tr, va, te = split3(df, "wakes_on_time")
Xtr, Xva, Xte = fz.transform(tr), fz.transform(va), fz.transform(te)
dur, dur_val = train_regressor(Xtr, tr.duration_min.to_numpy(), Xva, va.duration_min.to_numpy(), log_target=True, depth=9, leaf=20)
wake, wake_name, table = train_classifier(Xtr, tr.wakes_on_time, Xva, va.wakes_on_time, depth=8, leaf=25)
print("duration head val:", {k: round(v, 2) for k, v in dur_val.items()}, "| wake head:", wake_name); table.round(4)
# %% [markdown]
# ## 4 · Test evaluation
# %%
m_dur = report_regression(dur, Xte, te.duration_min.to_numpy(), "minutes"); m_dur
# %%
m_wake = report_binary(wake, Xte, te.wakes_on_time); m_wake
# %%
imp = group_importance(lambda X: wake.predict_proba(X)[:, 1], Xte, te.wakes_on_time.to_numpy(), fz.groups, lambda y, p: log_loss(y, p))
plot_importance(imp, "Wake-up head: permutation importance"); imp
# %%
ex = pd.DataFrame([dict(hour=15, sleep_last=4.5, bed_comfort=5, temp_c=34, day="sun", prev_naps=2, workload=8, battery=6),
                   dict(hour=17, sleep_last=8, bed_comfort=2, temp_c=24, day="tue", prev_naps=0, workload=2, battery=70)])
X = fz.transform(ex); ex["P(wake)"] = wake.predict_proba(X)[:, 1].round(3); ex["nap (min)"] = dur.predict(X).round(0); ex
# %% [markdown]
# ## 5 · Export + verify
# %%
heads = {"wake": export_head(wake, labels=["no", "yes"]), "duration": export_head(dur, task="regression")}
meta = make_metadata("v1.0", SEED, len(df), {"train": len(tr), "val": len(va), "test": len(te)},
    {"wake": {"algorithm": wake_name, "task": "binary", "metrics": m_wake, "candidates": table.round(4).to_dict("records")},
     "duration": {"algorithm": "Random Forest Regressor (log target)", "task": "regression", "metrics": m_dur}},
    imp, ["Synthetic data. Real nap length depends on things this model has never met (your landlord, your cat, a 3 pm lecture).", "Risk bands are fixed thresholds on wake-up probability."], "generate() in this notebook")
write_artifacts("model", "nap", "If I lie down for 5 minutes, will I wake up?", fz, tr, heads, {"wake": wake, "duration": dur}, meta, te[RAW])

