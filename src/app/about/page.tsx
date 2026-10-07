import type { Metadata } from "next";
import { GITHUB } from "@/components/Navbar";
import { Container } from "@/components/Sections";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <Container className="pt-14 sm:pt-20">
      <p className="mono text-xs text-muted">ABOUT</p>
      <h1 className="display mt-4 max-w-3xl text-5xl text-balance sm:text-7xl">Why would anyone build this?</h1>
      <div className="mt-10 max-w-2xl space-y-5 text-lg">
        <p>Machine learning is used for fraud detection, medical scans and self-driving cars. Nobody was using it to guess whether you'll actually study after opening Instagram. So I did.</p>
        <p>Predictably Human is a small project where I turn silly habits into ML problems, with proper notebooks and tested models behind them.</p>
        <p className="text-muted">The code, notebooks and datasets are on <a className="underline underline-offset-4 hover:text-accent" href={GITHUB} target="_blank" rel="noreferrer">GitHub</a>.</p>
      </div>
    </Container>
  );
}
