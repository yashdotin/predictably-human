import Link from "next/link";
import { HeroCard } from "./HeroCard";
import { Container } from "./Sections";

export function Hero() {
  return (
    <section className="pt-14 sm:pt-24"><Container>
      <div className="grid items-center gap-14 lg:grid-cols-[7fr_5fr]">
        <div>
          <p className="mono rise text-xs text-muted">A SILLY ML PROJECT</p>
          <h1 className="display rise mt-6 text-[clamp(2.75rem,7vw,5.5rem)] text-balance" style={{ animationDelay: ".05s" }}>We made ML models for the dumb things you do every day.</h1>
          <p className="rise mt-7 max-w-xl text-lg text-muted" style={{ animationDelay: ".12s" }}>Study or scroll? Quick nap or sleeping till dinner? Fix the bug or restart the server? There's a model for each.</p>
          <div className="rise mt-9 flex flex-wrap items-center gap-5" style={{ animationDelay: ".18s" }}>
            <Link href="/experiments" className="rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition hover:bg-accent active:scale-[.97]">Try the experiments →</Link>
            <Link href="/how-it-works" className="text-sm font-medium underline underline-offset-4 hover:text-accent">How it works</Link>
          </div>
        </div>
        <div className="rise" style={{ animationDelay: ".25s" }}><HeroCard /></div>
      </div>
    </Container></section>
  );
}
