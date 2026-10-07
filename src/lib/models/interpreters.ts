import { HUMOR, pick } from "@/lib/humor";
import { argmax, clamp, fmtDuration } from "@/lib/utils";
import type { Level, Outputs, PredictionResult } from "@/types/model";

export type Built = Omit<PredictionResult, "featureImportance" | "metadata">;
export interface Ctx { classes: Record<string, string[] | null> }
export interface Interpreter {
  score(o: Outputs, ref: Outputs): number;
  build(o: Outputs, seed: number, ctx: Ctx): Built;
}

const n = (v: number | number[]) => v as number;
const arr = (v: number | number[]) => v as number[];
const side = (key: string) => (o: Outputs, ref: Outputs) => (n(ref[key]) >= 0.5 ? n(o[key]) : 1 - n(o[key]));
const top = (p: number[], k: number) => p.map((value, i) => ({ value, i })).sort((a, b) => b.value - a.value).slice(0, k);
const topClass = (key: string) => (o: Outputs, ref: Outputs) => arr(o[key])[argmax(arr(ref[key]))];

function multiclass(humorKey: string, head: string, labels: Record<string, string>, headline: (cls: string, label: string) => string,
  probLabel: string, rows: number, extra?: (cls: string) => { label: string; value: string }[]) {
  return (o: Outputs, seed: number, ctx: Ctx): Built => {
    const p = arr(o[head]), classes = ctx.classes[head] as string[];
    const t = top(p, rows), best = classes[t[0].i], H = HUMOR[humorKey];
    return {
      headline: headline(best, labels[best] ?? best), probability: t[0].value, probabilityLabel: probLabel,
      probabilities: t.map((x) => ({ label: labels[classes[x.i]] ?? classes[x.i], value: x.value })),
      stats: extra ? extra(best) : [], message: pick(H.verdict[best], seed), recommendation: pick(H.advice[best], seed + 1),
    };
  };
}

const bucket = (p: number, cuts: [number, string][], fallback: string) => cuts.find(([c]) => p >= c)?.[1] ?? fallback;

export const INTERPRETERS: Record<string, Interpreter> = {
  "study-vs-instagram": {
    score: side("study"),
    build(o, seed) {
      const study = n(o.study), insta = 1 - study, b = insta >= 0.75 ? "high" : insta >= 0.45 ? "mid" : "low", H = HUMOR["study-vs-instagram"];
      return {
        headline: insta >= 0.5 ? "You're opening Instagram." : "You're actually studying.", probability: Math.max(study, insta),
        probabilityLabel: insta >= 0.5 ? "Instagram probability" : "Study probability",
        probabilities: [{ label: "Study", value: study }, { label: "Instagram", value: insta }], stats: [],
        message: pick(H.verdict[b], seed), recommendation: pick(H.advice[b], seed + 1),
      };
    },
  },
  maggi: {
    score: (o) => n(o.spice) / 100,
    build(o, seed) {
      const spice = clamp(n(o.spice), 0, 100), surv = n(o.survive), H = HUMOR.maggi;
      const bands: [string, string, Level, string][] = [["Safe", "This is fine.", "low", "low"], ["Suspicious", "Proceed with suspicion.", "mid", "mid"],
        ["Dangerous", "This is dangerous.", "high", "high"], ["Call someone", "Call someone.", "extreme", "extreme"]];
      const [label, headline, level, key] = bands[spice < 35 ? 0 : spice < 60 ? 1 : spice < 82 ? 2 : 3];
      return {
        headline, probability: surv, probabilityLabel: "Survival probability",
        probabilities: [{ label: "Survives", value: surv }, { label: "Struggles", value: 1 - surv }],
        stats: [{ label: "Spiciness", value: `${Math.round(spice)} / 100` }, { label: "Classification", value: label }],
        badge: { label, level }, message: pick(H.verdict[key], seed), recommendation: pick(H.advice[key], seed + 1),
      };
    },
  },
  nap: {
    score: side("wake"),
    build(o, seed) {
      const wake = n(o.wake), H = HUMOR.nap;
      const r: [string, string, Level][] = [["Low", "You'll probably wake up.", "low"], ["Moderate", "This could go either way.", "mid"],
        ["High", "That was never five minutes.", "high"], ["EXTREME", "You are not getting up.", "extreme"]];
      const i = wake >= 0.7 ? 0 : wake >= 0.4 ? 1 : wake >= 0.15 ? 2 : 3, key = ["low", "mid", "high", "extreme"][i];
      return {
        headline: r[i][1], probability: wake, probabilityLabel: "Wake-up probability",
        probabilities: [{ label: "Wakes up on time", value: wake }, { label: "Hibernation", value: 1 - wake }],
        stats: [{ label: "Expected nap", value: fmtDuration(n(o.duration)) }, { label: "Risk level", value: r[i][0] }],
        badge: { label: r[i][0], level: r[i][2] }, message: pick(H.verdict[key], seed), recommendation: pick(H.advice[key], seed + 1),
      };
    },
  },
  "next-app": {
    score: topClass("next"),
    build: (o, seed, ctx) => {
      const b = multiclass("next-app", "next", {}, (c) => `Next up: ${c}.`, "Probability", 3, undefined)(o, seed, ctx);
      const t3 = b.probabilities.reduce((a, r) => a + r.value, 0);
      return { ...b, stats: [{ label: "Top 3 combined", value: `${(t3 * 100).toFixed(1)}%` }] };
    },
  },
  "bathroom-phone": {
    score: side("phone"),
    build(o, seed) {
      const p = n(o.phone), b = p >= 0.8 ? "high" : p >= 0.5 ? "mid" : "low", H = HUMOR["bathroom-phone"];
      return {
        headline: p >= 0.5 ? "Yes. Obviously." : "Surprisingly, no.", probability: p, probabilityLabel: "Phone-taking probability",
        probabilities: [{ label: "Takes the phone", value: p }, { label: "Leaves it outside", value: 1 - p }], stats: [],
        message: pick(H.verdict[b], seed), recommendation: pick(H.advice[b], seed + 1),
      };
    },
  },
  "programmer-debug": {
    score: topClass("strategy"),
    build: multiclass("programmer-debug", "strategy",
      { fix: "Fix it properly", restart: "Restart the server", google: "Google the error", blame: "Blame the dependencies", giveup: "Give up (temporarily)" },
      (_c, label) => `${label}.`, "Probability", 5),
  },
  reply: {
    score: side("reply"),
    build(o, seed) {
      const p = n(o.reply), H = HUMOR.reply;
      const [status, key, level] = (p >= 0.65 ? ["Alive", "alive", "low"] : p >= 0.45 ? ["Uncertain", "uncertain", "mid"] : p >= 0.25 ? ["Concerning", "concerning", "high"] : ["Cooked", "cooked", "extreme"]) as [string, string, Level];
      return {
        headline: status === "Cooked" ? "You are cooked." : status === "Alive" ? "You are, for now, fine." : `Status: ${status.toLowerCase()}.`,
        probability: p, probabilityLabel: "Reply probability (next 12 h)",
        probabilities: [{ label: "Replies", value: p }, { label: "Silence", value: 1 - p }],
        stats: [{ label: "If she replies, in about", value: fmtDuration(n(o.eta)) }, { label: "Status", value: status }],
        badge: { label: status, level }, message: pick(H.verdict[key], seed), recommendation: pick(H.advice[key], seed + 1),
      };
    },
  },
  excuse: {
    score: topClass("excuse"),
    build: (() => {
      const text: Record<string, string[]> = {
        github: ["Sir actually GitHub was having an issue.", "Sir the repo wouldn't push, GitHub was down."],
        internet: ["Sir my internet was down all night.", "Sir the Wi-Fi died right before upload."],
        laptop: ["Sir my laptop hung right before I saved.", "Sir the laptop restarted for an update."],
        family: ["Sir there was a family emergency.", "Sir I had to go home urgently."],
        forgot: ["Sir I completely forgot. Sorry.", "Sir I thought the deadline was next week."],
        almost: ["Sir it's almost finished, one last bug.", "Sir I only need to fix the final part."],
        submitted: ["Sir I submitted it. Please check again.", "Sir I'm sure I uploaded it yesterday."],
        other: ["Sir it's a long story.", "Sir something came up."],
      };
      const cat: Record<string, string> = { github: "Technical difficulty", internet: "Connectivity", laptop: "Hardware", family: "Family", forgot: "Honesty (rare)", almost: "Almost finished", submitted: "\"Sir I submitted it\"", other: "Other" };
      const base = multiclass("excuse", "excuse", cat, (c) => c, "Confidence", 3);
      return (o: Outputs, seed: number, ctx: Ctx): Built => {
        const b = base(o, seed, ctx), classes = ctx.classes.excuse as string[], best = classes[argmax(arr(o.excuse))];
        return { ...b, headline: `\"${pick(text[best], seed + 2)}\"`, stats: [{ label: "Excuse category", value: cat[best] }] };
      };
    })(),
  },
};
