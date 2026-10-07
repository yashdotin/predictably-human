import type { Metadata } from "next";
import { ExperimentGrid } from "@/components/ExperimentGrid";
import { Container } from "@/components/Sections";

export const metadata: Metadata = { title: "Experiments" };

export default function Experiments() {
  return (
    <Container className="pt-14 sm:pt-20">
      <p className="mono text-xs text-muted">EIGHT MODELS · ONE QUESTION EACH</p>
      <h1 className="display mt-4 text-5xl sm:text-7xl">The experiments</h1>
      <p className="mt-5 max-w-xl text-muted">Pick one, answer a few questions, and the model gives you its opinion.</p>
      <div className="mt-12"><ExperimentGrid /></div>
    </Container>
  );
}
