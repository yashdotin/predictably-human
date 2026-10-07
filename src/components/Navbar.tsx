"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [["Experiments", "/experiments"], ["How it works", "/how-it-works"], ["About", "/about"]] as const;
export const GITHUB = "https://github.com/Yashdotin/predictably-human";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 24); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  return (
    <header className={cn("sticky top-0 z-50 border-b transition-all duration-300", scrolled ? "border-line bg-paper/90 backdrop-blur py-2.5" : "border-transparent bg-paper py-4")}>
      <nav aria-label="Primary" className="mx-auto flex max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="mono text-[15px] tracking-tight" onClick={() => setOpen(false)}>predictably<span className="text-accent">/</span>human</Link>
        <ul className="hidden items-center gap-7 text-sm md:flex">
          {LINKS.map(([t, h]) => <li key={h}><Link href={h} className="text-muted transition hover:text-ink">{t}</Link></li>)}
          <li><a href={GITHUB} target="_blank" rel="noreferrer" className="text-muted transition hover:text-ink">GitHub</a></li>
          <li><Link href="/experiments/study-vs-instagram" className="rounded-full bg-ink px-4 py-2 text-paper transition hover:bg-accent active:scale-[.97]">Run a prediction</Link></li>
        </ul>
        <button className="text-sm md:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      </nav>
      {open && (
        <ul id="mobile-nav" className="mx-auto mt-3 max-w-[1200px] space-y-1 px-5 pb-3 text-lg md:hidden">
          {LINKS.map(([t, h]) => <li key={h}><Link href={h} className="block py-2" onClick={() => setOpen(false)}>{t}</Link></li>)}
          <li><a href={GITHUB} className="block py-2" target="_blank" rel="noreferrer">GitHub</a></li>
          <li><Link href="/experiments/study-vs-instagram" className="mt-2 inline-block rounded-full bg-ink px-5 py-2.5 text-base text-paper" onClick={() => setOpen(false)}>Run a prediction</Link></li>
        </ul>
      )}
    </header>
  );
}
