import { Link } from "react-router-dom";
import { Chip, GlassCard } from "../common";
import ModuleIcon from "./ModuleIcon";

/**
 * One dashboard module. Available modules are links; "soon" modules render as muted, non-interactive cards.
 * @param {{ module: { title: string, description: string, icon: string, to?: string, cta?: string,
 *   primary?: boolean, status?: string }, style?: object }} props  status "soon" = placeholder
 */
export default function FeatureCard({ module, style }) {
  const available = module.status !== "soon";
  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${module.primary ? "bg-amber-300 text-slate-900" : "bg-amber-300/10 text-amber-300"}`}>
          <ModuleIcon name={module.icon} />
        </span>
        {!available && <Chip className="text-xs">Coming soon</Chip>}
      </div>
      <h2 className="mt-6 text-xl font-semibold text-white">{module.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{module.description}</p>
      {available && (
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300">
          {module.cta}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      )}
    </>
  );

  const base = `sp-fade flex h-full flex-col rounded-3xl p-6 md:p-7 ${module.primary ? "sp-card border-amber-300/30" : ""}`;
  if (!available) {
    return <GlassCard className={`${base} opacity-60`} style={style}>{body}</GlassCard>;
  }
  return (
    <GlassCard
      as={Link} to={module.to} style={style}
      className={`${base} group transition duration-300 hover:-translate-y-1 hover:border-amber-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50`}
    >
      {body}
    </GlassCard>
  );
}
