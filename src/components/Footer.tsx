import Link from "next/link";
import { GITHUB } from "./Navbar";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Made with Python, curiosity and bad priorities.</p>
        <p className="max-w-md text-xs">Just for fun. The data is made up and nothing you enter is saved.</p>
        <div className="flex gap-5"><Link href="/how-it-works" className="hover:text-ink">How it works</Link><a href={GITHUB} className="hover:text-ink" target="_blank" rel="noreferrer">GitHub</a></div>
      </div>
    </footer>
  );
}
