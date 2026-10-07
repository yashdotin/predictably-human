import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperimentRunner } from "@/components/ExperimentRunner";
import { Container } from "@/components/Sections";
import { MODELS, getModel } from "@/data/models";

type Params = { slug: string };
export const dynamicParams = false;
export const generateStaticParams = () => MODELS.map((m) => ({ slug: m.id }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const m = getModel((await params).slug);
  return m ? { title: m.name, description: m.short } : {};
}

export default async function Experiment({ params }: { params: Promise<Params> }) {
  const def = getModel((await params).slug);
  if (!def) notFound();
  return (
    <Container className="pt-10 sm:pt-14">
      <Link href="/experiments" className="text-sm text-muted hover:text-ink">← Back to experiments</Link>
      <p className="mono mt-8 text-xs text-muted">{String(def.index).padStart(2, "0")} / {def.category.toUpperCase()}</p>
      <h1 className="display mt-3 max-w-4xl text-4xl text-balance sm:text-6xl">{def.name}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{def.short}</p>
      {def.disclaimer && <p className="mt-3 max-w-2xl text-sm text-muted">{def.disclaimer}</p>}
      <ExperimentRunner def={def} />
    </Container>
  );
}
