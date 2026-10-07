import { Button, GlassCard, SectionTitle } from "../components/common";
import { Footer, Navbar } from "../components/layout";
import { STEPS } from "../constants/content";

const SKILLS = [
  { name: "Web development", note: "Build and deploy a small app", tone: "from-amber-300/40 via-orange-400/20" },
  { name: "Cloud and DevOps", note: "Set up a pipeline from scratch", tone: "from-cyan-300/35 via-sky-500/20" },
  { name: "Data and AI", note: "Clean, model and explain a dataset", tone: "from-fuchsia-400/30 via-violet-500/20" },
];

const REASONS = [
  { title: "Proof, not claims", body: "Every badge links to the work behind it." },
  { title: "Practice built in", body: "You do the task before you get the review." },
  { title: "Feedback you can use", body: "Reviews say what to fix, not just a score." },
];

function Hero() {
  return (
    <section className="sp-hero relative overflow-hidden px-5 pb-24 pt-40 md:pt-48">
      <div className="sp-hero-bg" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <h1 className="sp-fade sp-h1 max-w-xl text-5xl font-bold text-white md:text-7xl" style={{ animationDelay: ".3s" }}>
          Show what you can actually do.
        </h1>
        <p className="sp-fade mt-6 max-w-md text-lg leading-relaxed text-slate-300" style={{ animationDelay: ".5s" }}>
          Turn your certificates into proof. Practice on real tasks, get a review, and share the result.
        </p>
        <div className="sp-fade mt-9 flex flex-wrap gap-3" style={{ animationDelay: ".7s" }}>
          <Button href="/register">Start now</Button>
          <Button href="/how-to-use" variant="outline">See how it works</Button>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle>From certificate to proof in three steps</SectionTitle>
        <ol className="relative mt-14 space-y-6 border-l border-slate-800 pl-8 md:ml-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="sp-marker absolute top-5 grid h-9 w-9 place-items-center rounded-full border border-amber-300/50 text-sm font-semibold text-amber-300">{i + 1}</span>
              <GlassCard className="max-w-xl rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-slate-400">{s.body}</p>
              </GlassCard>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle>Pick a skill and prove it</SectionTitle>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SKILLS.map((s) => (
            <GlassCard key={s.name} as="a" href="/register" className="sp-tall group flex flex-col justify-end overflow-hidden rounded-3xl p-6 transition hover:border-amber-300/50">
              <div className={`-mx-6 -mt-6 mb-auto h-48 bg-gradient-to-b ${s.tone} to-transparent`} />
              <h3 className="text-xl font-semibold text-white">{s.name}</h3>
              <p className="mt-1 text-slate-400">{s.note}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="px-5 py-24">
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {REASONS.map((r) => (
          <div key={r.title} className="rounded-2xl border border-slate-700/70 p-6">
            <h3 className="font-semibold text-white">{r.title}</h3>
            <p className="mt-2 text-slate-400">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-5 py-24">
      <GlassCard className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-8 py-16 text-center">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
        <SectionTitle className="relative mx-auto">Ready to build your proof?</SectionTitle>
        <p className="relative mx-auto mt-4 max-w-md text-slate-400">Create a free account and submit your first certificate.</p>
        <Button href="/register" className="relative mt-8 px-8">Create account</Button>
      </GlassCard>
    </section>
  );
}

export default function Home() {
  return (
    <div className="sp-page sp-page-home min-h-screen font-sans text-slate-100">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Skills />
        <Why />
        <CTA />
      </main>
    </div>
  );
}
