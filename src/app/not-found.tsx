import Link from "next/link";
import { Container } from "@/components/Sections";

export default function NotFound() {
  return (
    <Container className="pt-24">
      <p className="mono text-xs text-muted">404</p>
      <h1 className="display mt-4 text-6xl">The model predicted you'd end up here.</h1>
      <Link href="/experiments" className="mt-8 inline-block text-sm underline underline-offset-4 hover:text-accent">Back to the experiments</Link>
    </Container>
  );
}
