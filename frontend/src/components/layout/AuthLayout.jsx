import { GlassCard, Logo } from "../common";
import { STEPS } from "../../constants/content";

function Showcase() {
  return (
    <div className="relative hidden flex-1 flex-col justify-between p-12 lg:flex">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
          Turn certificates into proof you can do the work.
        </h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-400">
          Create your account to start building a record employers can trust.
        </p>
        <ol className="mt-10 space-y-3">
          {STEPS.map((s, i) => (
            <GlassCard as="li" key={s.title} className="flex items-start gap-4 rounded-2xl p-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-300/15 text-sm font-semibold text-amber-300">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-slate-100">{s.title}</p>
                <p className="text-sm text-slate-400">{s.short}</p>
              </div>
            </GlassCard>
          ))}
        </ol>
      </div>
    </div>
  );
}

/**
 * Shared shell for the login and register pages: showcase on the left, form card on the right.
 * @param {{ title: string, subtitle: string, children?: import("react").ReactNode, footer?: import("react").ReactNode }} props
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="sp-page sp-page-scene flex min-h-screen font-sans text-slate-100">
      <Showcase />
      <main className="sp-formcol flex items-center justify-center px-5 py-10 lg:shrink-0 lg:px-10">
        <GlassCard className="sp-card w-full max-w-md rounded-3xl p-8">
          <Logo size="sm" className="mb-6 lg:hidden" />
          <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
          <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>
          {children}
          {footer && <p className="mt-6 text-center text-sm text-slate-400">{footer}</p>}
        </GlassCard>
      </main>
    </div>
  );
}
