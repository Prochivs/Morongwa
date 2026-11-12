"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Brand } from "./brand";

const links = [["How it works", "/how-it-works"], ["Pricing", "/pricing"], ["About", "/about"], ["FAQs", "/faqs"], ["Contact", "/contact"]];
export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur"><div className="container-shell flex h-18 items-center justify-between py-4"><Brand /><nav className="hidden items-center gap-7 md:flex">{links.map(([label, href]) => <Link className="text-sm font-medium text-slate-600 hover:text-navy" href={href} key={href}>{label}</Link>)}<Link className="text-sm font-semibold text-navy" href="/login">Sign in</Link><Link className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" href="/register">Request assistance</Link></nav><button aria-label="Toggle navigation" aria-expanded={open} className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>{open && <nav className="container-shell flex flex-col gap-4 border-t py-5 md:hidden">{links.map(([label, href]) => <Link onClick={() => setOpen(false)} className="font-medium" href={href} key={href}>{label}</Link>)}<Link href="/login">Sign in</Link><Link className="rounded-lg bg-brand px-4 py-3 text-center font-semibold text-white" href="/register">Request assistance</Link></nav>}</header>
    <main>{children}</main>
    <footer className="bg-navy text-white"><div className="container-shell grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]"><div><Brand light /><p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">Professional queue assistance in Gaborone, delivered with clear rules, verified agents, and real-time updates.</p></div><div><h2 className="text-sm font-bold">Explore</h2><div className="mt-4 grid gap-3 text-sm text-slate-300">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div></div><div><h2 className="text-sm font-bold">Legal & support</h2><div className="mt-4 grid gap-3 text-sm text-slate-300"><Link href="/terms">Terms & conditions</Link><Link href="/privacy">Privacy policy</Link><Link href="/cancellation-policy">Cancellation & refunds</Link><Link href="/contact">Contact us</Link></div></div></div><div className="border-t border-white/10"><div className="container-shell flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} QueueMate Botswana</span><span>Queue assistance is always subject to institutional rules.</span></div></div></footer>
  </>;
}
