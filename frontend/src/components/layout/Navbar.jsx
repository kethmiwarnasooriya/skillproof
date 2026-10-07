import { useState } from "react";
import { Button, GlassCard, Logo } from "../common";
import { NAV_LINKS } from "../../constants/content";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <GlassCard as="nav" className="mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3">
        <Logo />
        <ul className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          {NAV_LINKS.map((n) => (
            <li key={n.href}><a href={n.href} className="hover:text-amber-300">{n.label}</a></li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          <a href="/login" className="text-sm text-slate-300 hover:text-white">Sign in</a>
          <Button href="/register" size="sm">Start</Button>
        </div>
        <button
          onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-700 text-slate-200 md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </GlassCard>
      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-xl md:hidden">
          <ul className="space-y-4 text-slate-200">
            {NAV_LINKS.map((n) => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}
            <li><a href="/login">Sign in</a></li>
          </ul>
          <Button href="/register" className="mt-5 w-full">Start</Button>
        </div>
      )}
    </header>
  );
}
