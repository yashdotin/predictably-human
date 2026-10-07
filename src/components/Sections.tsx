import Link from "next/link";
import { wallStats } from "@/lib/server-metadata";
import { ExperimentGrid } from "./ExperimentGrid";

export const Container = ({ children, className = "" }: { children: React.ReactNode; className?: string }) =>
  <div className={`mx-auto max-w-[1200px] px-5 sm:px-8 ${className}`}>{children}</div>;

export function Why() {
  return (
    <section className="border-y border-line py-20 sm:py-28"><Container>
      <p className="mono text-xs text-muted">WHY?</p>
      <p className="display mt-4 max-w-3xl text-4xl text-balance sm:text-6xl">Machine learning solves serious problems all day.<br /><span className="text-muted">We gave it a break.</span></p>
    </Container></section>
  );
}

export function Experiments() {
  return (
    <section id="experiments" className="scroll-mt-20 pt-20 sm:pt-28"><Container>
      <div className="mb-10 flex items-end justify-between gap-6"><h2 className="display text-4xl sm:text-5xl">The experiments</h2>
        <Link href="/experiments" className="hidden text-sm text-muted hover:text-ink sm:block">All eight →</Link></div>
      <ExperimentGrid />
    </Container></section>
  );
}

const PIPE = [["Human behavior", "Something small, silly and very relatable."], ["Data", "Made-up data with a bit of noise."], ["Features", "Raw inputs like time and apps turned into numbers."],
  ["Model", "Logistic regression or random forest, whichever did better."], ["Prediction", "A probability, right on the page."]];

export function Pipeline() {
  return (
    <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-5">
      {PIPE.map(([t, d], i) => <li key={t} className="bg-card p-5"><p className="mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</p><p className="mt-3 font-medium">{t}</p><p className="mt-1.5 text-sm text-muted">{d}</p></li>)}
    </ol>
  );
}

export function HowItWorksTeaser() {
  return (
    <section className="pt-24 sm:pt-32"><Container>
      <h2 className="display text-4xl sm:text-5xl">How it works</h2>
      <p className="mt-4 max-w-2xl text-muted">The data is made up and the models learn from it like any other data. Nothing is trained on this page, it just runs the finished model.</p>
      <div className="mt-10"><Pipeline /></div>
      <Link href="/how-it-works" className="mt-6 inline-block text-sm font-medium underline underline-offset-4 hover:text-accent">See how it's made</Link>
    </Container></section>
  );
}

export function ModelWall() {
  const { models, rows } = wallStats();
  const stats: [string, string][] = [["Models", String(models)], ["Datasets", String(models)], ["Rows of data", rows.toLocaleString()]];
  return (
    <section className="pt-24 sm:pt-32"><Container>
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {stats.map(([k, v]) => <div key={k} className="bg-card p-5"><dt className="mono text-[11px] text-muted">{k.toUpperCase()}</dt><dd className="display mt-2 text-3xl">{v}</dd></div>)}
      </dl>
    </Container></section>
  );
}

export function AboutBlock() {
  return (
    <section className="pt-24 sm:pt-32"><Container>
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]"><h2 className="display text-4xl sm:text-5xl">About the experiment</h2>
        <div className="max-w-2xl space-y-4 text-lg"><p>I built this to turn silly everyday habits into machine learning problems.</p>
          <p className="text-muted">Every model has its own notebook and dataset. The site just shows what comes out of them.</p>
          <Link href="/about" className="inline-block text-sm font-medium underline underline-offset-4 hover:text-accent">More about the project</Link></div></div>
    </Container></section>
  );
}
