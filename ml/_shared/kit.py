from __future__ import annotations
import json, math, datetime as dt, pathlib
import numpy as np, pandas as pd
import matplotlib.pyplot as plt
from sklearn.calibration import calibration_curve
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.isotonic import IsotonicRegression
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (accuracy_score, roc_auc_score, log_loss, f1_score, brier_score_loss,
                             mean_absolute_error, r2_score, confusion_matrix, ConfusionMatrixDisplay, roc_curve)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

SEED = 42
plt.rcParams.update({"figure.dpi": 100, "axes.spines.top": False, "axes.spines.right": False})

def sigmoid(z): return 1.0 / (1.0 + np.exp(-z))

def softmax(z):
    z = z - z.max(1, keepdims=True); e = np.exp(z); return e / e.sum(1, keepdims=True)

def sample_categorical(p, rng):
    c = p.cumsum(1); u = rng.random((len(p), 1)); return (u > c).sum(1).clip(0, p.shape[1] - 1)

def Num(name, lo, hi, enc="raw"):  return {"name": name, "kind": "num", "lo": lo, "hi": hi, "enc": enc}
def Cat(name, values):             return {"name": name, "kind": "cat", "values": list(values)}

class Featurizer:
    def __init__(self, inputs):
        self.inputs, self.columns, self.groups = inputs, [], {}
        for s in inputs:
            n, start = s["name"], len(self.columns)
            if s["kind"] == "cat":
                self.columns += [{"op": "onehot", "src": n, "value": v, "name": f"{n}={v}"} for v in s["values"]]
            elif s["enc"] == "cyc":
                p = s["hi"]
                self.columns += [{"op": "sin", "src": n, "period": p, "name": f"{n}_sin"},
                                 {"op": "cos", "src": n, "period": p, "name": f"{n}_cos"}]
            elif s["enc"] == "log1p":
                self.columns.append({"op": "log1p", "src": n, "lo": s["lo"], "hi": s["hi"], "name": f"{n}_log1p"})
            else:
                self.columns.append({"op": "num", "src": n, "lo": s["lo"], "hi": s["hi"], "name": n})
            self.groups[n] = list(range(start, len(self.columns)))
        self.names = [c["name"] for c in self.columns]

    def transform(self, df):
        out = np.empty((len(df), len(self.columns)))
        for j, c in enumerate(self.columns):
            x = df[c["src"]].to_numpy()
            if c["op"] == "onehot": out[:, j] = (x.astype(object) == c["value"]).astype(float)
            else:
                x = x.astype(float)
                if c["op"] == "num":     out[:, j] = np.clip(x, c["lo"], c["hi"])
                elif c["op"] == "log1p": out[:, j] = np.log1p(np.clip(x, c["lo"], c["hi"]))
                elif c["op"] == "sin":   out[:, j] = np.sin(2 * np.pi * x / c["period"])
                elif c["op"] == "cos":   out[:, j] = np.cos(2 * np.pi * x / c["period"])
        return out

    def spec(self, df_ref):
        base = {}
        for s in self.inputs:
            col = df_ref[s["name"]]
            base[s["name"]] = col.mode().iloc[0] if s["kind"] == "cat" else float(col.median())
        return {"inputs": self.inputs, "columns": self.columns, "baseline": base}

def split3(df, target, seed=SEED, stratify=True):
    s = df[target] if stratify else None
    tr, rest = train_test_split(df, test_size=0.30, random_state=seed, stratify=s)
    s2 = rest[target] if stratify else None
    va, te = train_test_split(rest, test_size=0.50, random_state=seed, stratify=s2)
    return tr.reset_index(drop=True), va.reset_index(drop=True), te.reset_index(drop=True)

class Fitted:
    def __init__(self, kind, est, K, scaler=None, iso=None, log_target=False):
        self.kind, self.est, self.K, self.scaler, self.iso, self.log_target = kind, est, K, scaler, iso, log_target
    def predict_proba(self, X):
        if self.kind == "linear": return self.est.predict_proba(self.scaler.transform(X))
        p = self.est.predict_proba(X)
        if self.iso is not None:
            p1 = self.iso.predict(p[:, 1]); return np.column_stack([1 - p1, p1])
        return p
    def predict(self, X):
        v = self.est.predict(X)
        return np.exp(v) if self.log_target else v

def _rf_c(seed, depth, leaf, trees):
    return RandomForestClassifier(n_estimators=trees, max_depth=depth, min_samples_leaf=leaf,
                                  max_features="sqrt", random_state=seed, n_jobs=-1)

def train_classifier(Xtr, ytr, Xva, yva, seed=SEED, depth=8, leaf=25, trees=40):
    K = len(np.unique(ytr)); rows = []
    sc = StandardScaler().fit(Xtr)
    lr = LogisticRegression(max_iter=4000, C=1.0).fit(sc.transform(Xtr), ytr)
    cands = {"Logistic Regression": Fitted("linear", lr, K, scaler=sc)}
    if K == 2:
        Xf, Xc, yf, yc = train_test_split(Xtr, ytr, test_size=0.25, stratify=ytr, random_state=seed)
        rf = _rf_c(seed, depth, leaf, trees).fit(Xf, yf)
        iso = IsotonicRegression(out_of_bounds="clip").fit(rf.predict_proba(Xc)[:, 1], yc)
        cands["Random Forest (isotonic-calibrated)"] = Fitted("forest", rf, K, iso=iso)
    else:
        cands["Random Forest"] = Fitted("forest", _rf_c(seed, depth, leaf, trees).fit(Xtr, ytr), K)
    for n, f in cands.items():
        p = f.predict_proba(Xva)
        rows.append({"model": n, "val_log_loss": log_loss(yva, p, labels=list(range(K))),
                     "val_accuracy": accuracy_score(yva, p.argmax(1))})
    table = pd.DataFrame(rows).sort_values("val_log_loss").reset_index(drop=True)
    best = table.loc[0, "model"]
    return cands[best], best, table

def train_regressor(Xtr, ytr, Xva, yva, log_target=False, seed=SEED, depth=9, leaf=25, trees=40):
    t = (lambda v: np.log(v)) if log_target else (lambda v: v)
    rf = RandomForestRegressor(n_estimators=trees, max_depth=depth, min_samples_leaf=leaf,
                               max_features=0.7, random_state=seed, n_jobs=-1).fit(Xtr, t(ytr))
    f = Fitted("forest", rf, 1, log_target=log_target)
    ridge = Ridge(1.0).fit(StandardScaler().fit_transform(Xtr), t(ytr))
    base = mean_absolute_error(yva, np.exp(ridge.predict(StandardScaler().fit(Xtr).transform(Xva))) if log_target
                               else ridge.predict(StandardScaler().fit(Xtr).transform(Xva)))
    return f, {"val_mae": mean_absolute_error(yva, f.predict(Xva)), "ridge_baseline_val_mae": base}

def report_binary(f, X, y, title="test"):
    p = f.predict_proba(X)[:, 1]
    m = {"accuracy": accuracy_score(y, p > .5), "roc_auc": roc_auc_score(y, p),
         "log_loss": log_loss(y, p), "brier": brier_score_loss(y, p)}
    fig, ax = plt.subplots(1, 3, figsize=(14, 3.8))
    fpr, tpr, _ = roc_curve(y, p); ax[0].plot(fpr, tpr, color="#E4572E"); ax[0].plot([0, 1], [0, 1], "--", c="#999")
    ax[0].set(title=f"ROC (AUC {m['roc_auc']:.3f})", xlabel="false positive rate", ylabel="true positive rate")
    fx, fy = calibration_curve(y, p, n_bins=10, strategy="quantile")
    ax[1].plot(fx, fy, "o-", color="#16150F"); ax[1].plot([0, 1], [0, 1], "--", c="#999")
    ax[1].set(title="Calibration", xlabel="predicted", ylabel="observed")
    ConfusionMatrixDisplay(confusion_matrix(y, p > .5)).plot(ax=ax[2], colorbar=False, cmap="Greys")
    ax[2].set(title=f"Confusion ({title})"); plt.tight_layout(); plt.show()
    return {k: round(float(v), 4) for k, v in m.items()}

def report_multiclass(f, X, y, labels, title="test"):
    p = f.predict_proba(X); K = len(labels)
    top3 = np.mean([yy in np.argsort(-pp)[:3] for yy, pp in zip(y, p)])
    m = {"accuracy": accuracy_score(y, p.argmax(1)), "macro_f1": f1_score(y, p.argmax(1), average="macro"),
         "log_loss": log_loss(y, p, labels=list(range(K))), "top3_accuracy": top3}
    fig, ax = plt.subplots(figsize=(6.2, 5.2))
    ConfusionMatrixDisplay(confusion_matrix(y, p.argmax(1), normalize="true"), display_labels=labels).plot(
        ax=ax, colorbar=False, cmap="Greys", xticks_rotation=40, values_format=".2f")
    ax.set(title=f"Row-normalised confusion ({title})"); plt.tight_layout(); plt.show()
    return {k: round(float(v), 4) for k, v in m.items()}

def report_regression(f, X, y, unit=""):
    p = f.predict(X); m = {"mae": mean_absolute_error(y, p), "r2": r2_score(y, p)}
    fig, ax = plt.subplots(figsize=(4.6, 4.2)); ax.scatter(y, p, s=5, alpha=.3, color="#16150F")
    lim = [min(y.min(), p.min()), max(y.max(), p.max())]; ax.plot(lim, lim, "--", c="#E4572E")
    ax.set(title=f"Predicted vs actual (R2 {m['r2']:.3f})", xlabel=f"actual {unit}", ylabel=f"predicted {unit}")
    plt.tight_layout(); plt.show()
    return {k: round(float(v), 4) for k, v in m.items()}

def group_importance(predict, X, y, groups, loss, repeats=3, seed=SEED):
    rng = np.random.default_rng(seed); base = loss(y, predict(X)); out = {}
    for name, idx in groups.items():
        d = []
        for _ in range(repeats):
            Xp = X.copy(); Xp[:, idx] = X[rng.permutation(len(X))][:, idx]; d.append(loss(y, predict(Xp)) - base)
        out[name] = max(float(np.mean(d)), 0.0)
    tot = sum(out.values()) or 1.0
    return dict(sorted(((k, round(v / tot, 4)) for k, v in out.items()), key=lambda kv: -kv[1]))

def plot_importance(imp, title="Feature importance (permutation)"):
    fig, ax = plt.subplots(figsize=(6, 0.38 * len(imp) + 1)); ks = list(imp)[::-1]
    ax.barh(ks, [imp[k] for k in ks], color="#E4572E"); ax.set(title=title); plt.tight_layout(); plt.show()

def eda(df, target, feats, kind="binary", max_cols=4):
    fig, ax = plt.subplots(1, 1, figsize=(5, 2.6))
    if kind == "regression": ax.hist(df[target], bins=40, color="#16150F")
    else: df[target].value_counts(normalize=True).sort_index().plot.bar(ax=ax, color="#16150F")
    ax.set(title=f"Target: {target}"); plt.tight_layout(); plt.show()
    rows = math.ceil(len(feats) / max_cols); fig, axes = plt.subplots(rows, max_cols, figsize=(3.6 * max_cols, 2.8 * rows))
    for a, c in zip(np.ravel(axes), feats):
        x = df[c]
        if x.dtype == object or x.nunique() <= 8: g = x.astype(str)
        else: g = pd.qcut(x, 8, duplicates="drop").astype(str).map(lambda s: s.split(",")[0].strip("([ "))
        if kind == "multiclass":
            pd.crosstab(g, df[target], normalize="index").plot.bar(stacked=True, ax=a, legend=False, width=.85)
        else:
            df.groupby(g)[target].mean().plot.bar(ax=a, color="#E4572E", width=.8)
        a.set(title=c, xlabel="")
        a.tick_params(axis="x", labelrotation=60, labelsize=7)
    for a in np.ravel(axes)[len(feats):]: a.axis("off")
    plt.tight_layout(); plt.show()

def _g(x, d=9): return float(f"{float(x):.{d}g}")

def _tree(tree, mode):
    t = tree.tree_; f, th, l, r, v = [], [], [], [], []
    for i in range(t.node_count):
        if t.children_left[i] == -1:
            f.append(-1); th.append(0); l.append(len(v)); r.append(0)
            val = t.value[i, 0]
            if mode == "reg": v.append(_g(val[0], 6))
            else:
                p = val / val.sum()
                v.append(round(float(p[1]), 4) if mode == "bin" else [round(float(q), 3) for q in p])
        else:
            f.append(int(t.feature[i])); th.append(_g(t.threshold[i])); l.append(int(t.children_left[i]))
            r.append(int(t.children_right[i]))
    return {"f": f, "t": th, "l": l, "r": r, "v": v}

def export_head(fit, labels=None, task=None):
    if fit.kind == "linear":
        e, s = fit.est, fit.scaler
        return {"kind": "linear", "task": "binary" if fit.K == 2 else "multiclass", "classes": labels,
                "mean": [_g(x) for x in s.mean_], "scale": [_g(x) for x in s.scale_],
                "coef": [[_g(x) for x in row] for row in e.coef_], "intercept": [_g(x) for x in e.intercept_]}
    mode = "reg" if task == "regression" else ("bin" if fit.K == 2 else "multi")
    head = {"kind": "forest", "task": task or ("binary" if fit.K == 2 else "multiclass"), "classes": labels,
            "trees": [_tree(t, mode) for t in fit.est.estimators_],
            "calibration": None, "target": "log" if fit.log_target else "raw"}
    if fit.iso is not None:
        head["calibration"] = {"x": [_g(x, 7) for x in fit.iso.X_thresholds_], "y": [_g(x, 7) for x in fit.iso.y_thresholds_]}
    return head

class Runtime:
    def __init__(self, model): self.m = model

    def vector(self, raw):
        v = []
        for c in self.m["featurizer"]["columns"]:
            x = raw[c["src"]]
            if c["op"] == "onehot": v.append(1.0 if x == c["value"] else 0.0)
            elif c["op"] == "num": v.append(min(max(float(x), c["lo"]), c["hi"]))
            elif c["op"] == "log1p": v.append(math.log1p(min(max(float(x), c["lo"]), c["hi"])))
            elif c["op"] == "sin": v.append(math.sin(2 * math.pi * float(x) / c["period"]))
            else: v.append(math.cos(2 * math.pi * float(x) / c["period"]))
        return v

    def head(self, h, x):
        if h["kind"] == "linear":
            z = [sum((xi - m) / s * w for xi, m, s, w in zip(x, h["mean"], h["scale"], row)) + b
                 for row, b in zip(h["coef"], h["intercept"])]
            if h["task"] == "binary": return 1 / (1 + math.exp(-z[0]))
            mx = max(z); e = [math.exp(q - mx) for q in z]; s = sum(e); return [q / s for q in e]
        acc = None
        for tr in h["trees"]:
            i = 0
            while tr["f"][i] >= 0:
                i = tr["l"][i] if float(np.float32(x[tr["f"][i]])) <= tr["t"][i] else tr["r"][i]
            val = tr["v"][tr["l"][i]]
            acc = val if acc is None else ([a + b for a, b in zip(acc, val)] if isinstance(val, list) else acc + val)
        n = len(h["trees"])
        out = [a / n for a in acc] if isinstance(acc, list) else acc / n
        if isinstance(out, list):
            s = sum(out); return [q / s for q in out]
        if h["task"] == "regression": return math.exp(out) if h["target"] == "log" else out
        cal = h["calibration"]
        return float(np.interp(out, cal["x"], cal["y"])) if cal else out

    def run(self, raw):
        x = self.vector(raw); return {k: self.head(h, x) for k, h in self.m["heads"].items()}

def verify_export(rt, fits, fz, df_raw, n=300):
    X = fz.transform(df_raw.iloc[:n]); err = {}
    for name, fit in fits.items():
        ref = fit.predict(X) if fit.K == 1 else (fit.predict_proba(X)[:, 1] if fit.K == 2 else fit.predict_proba(X))
        got = np.array([rt.run(r)[name] for r in df_raw.iloc[:n].to_dict("records")])
        err[name] = float(np.abs(np.asarray(ref) - got).max() / (np.abs(ref).max() if fit.K == 1 else 1))
    return err

def write_artifacts(out, model_id, title, fz, df_ref, heads, fits, metadata, df_raw_test, n_fixtures=200):
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    model = {"schema": 1, "id": model_id, "featurizer": fz.spec(df_ref), "heads": heads}
    rt = Runtime(model); err = verify_export(rt, fits, fz, df_raw_test)
    metadata.update({"id": model_id, "name": title, "export_relative_error": {k: round(v, 5) for k, v in err.items()}})
    sample = df_raw_test.iloc[:n_fixtures]
    fixtures = [{"input": {k: (v.item() if hasattr(v, "item") else v) for k, v in r.items()},
                 "output": {h: (round(o, 10) if not isinstance(o, list) else [round(q, 10) for q in o])
                            for h, o in rt.run(r).items()}} for r in sample.to_dict("records")]
    (out / "model.json").write_text(json.dumps(model, separators=(",", ":")))
    (out / "metadata.json").write_text(json.dumps(metadata, indent=2))
    (out / "parity_fixtures.json").write_text(json.dumps(fixtures, separators=(",", ":")))
    sz = sum(p.stat().st_size for p in out.iterdir()) / 1024
    print(f"wrote {out} ({sz:.0f} KB total) | export error vs sklearn: {err}")
    return err

def make_metadata(version, seed, n, splits, heads_meta, importance, limitations, generator):
    return {"version": version, "trained_at": dt.date.today().isoformat(), "seed": seed, "n_samples": int(n),
            "splits": splits, "heads": heads_meta, "feature_importance": [{"feature": k, "importance": v} for k, v in importance.items()],
            "limitations": limitations, "dataset": {"source": "synthetic", "generator": generator, "rows": int(n)}}

