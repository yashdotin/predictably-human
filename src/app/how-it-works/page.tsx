import type { Metadata } from "next";
import { Container, Pipeline } from "@/components/Sections";

export const metadata: Metadata = { title: "How it works" };

const BLOCKS: [string, string][] = [
  ["Where the data comes from", "There's no real dataset for \"will I open Instagram\", so I wrote small programs that make one. Each has a hidden trait like discipline or spice tolerance, a few sensible rules, and some random noise. The code and the dataset.csv are inside each notebook folder."],
  ["What accuracy means here", "The scores show how well a model learns the made-up data, not how well it knows you. Each notebook also shows a best possible score, so you can see how close the model got."],
  ["Building the models", "Every experiment has its own notebook. It makes the data, cleans it, tries logistic regression and a random forest, and keeps whichever did better."],
  ["Using them on the site", "The finished models are saved as small JSON files and the page reads them directly. The answers are checked against the Python version so both match."],
  ["The \"Why?\" box", "For every prediction, one input is changed at a time to see how much the answer moves. The ones that move it most are shown first."],
  ["Privacy", "Nothing you enter is saved. No accounts, no tracking. The reply experiment only uses made-up data."],
];

export default function HowItWorks() {
  return (
    <Container className="pt-14 sm:pt-20">
      <p className="mono text-xs text-muted">HOW IT'S MADE</p>
      <h1 className="display mt-4 text-5xl sm:text-7xl">How it works</h1>
      <p className="mt-5 max-w-2xl text-muted">Small models on silly topics. The idea is a joke, the work behind it is real.</p>
      <div className="mt-12"><Pipeline /></div>
      <div className="mt-16 grid gap-x-16 gap-y-10 md:grid-cols-2">
        {BLOCKS.map(([t, d]) => <section key={t}><h2 className="display text-3xl">{t}</h2><p className="mt-3 text-muted text-pretty">{d}</p></section>)}
      </div>
    </Container>
  );
}
