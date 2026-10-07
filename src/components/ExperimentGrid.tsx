import { MODELS } from "@/data/models";
import { readMetadata } from "@/lib/server-metadata";
import { ExperimentCard } from "./ExperimentCard";

export function ExperimentGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {MODELS.map((m) => <li key={m.id}><ExperimentCard def={m} algorithm={readMetadata(m.id)?.heads[m.primaryHead]?.algorithm.replace(" (isotonic-calibrated)", "")} /></li>)}
    </ul>
  );
}
