const TONES = {
  neutral: "border-slate-700 bg-slate-800/60 text-slate-200",
  amber: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  sky: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  fuchsia: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  red: "border-red-500/30 bg-red-500/10 text-red-300",
};

/**
 * Small rounded label, e.g. a skill or a status.
 * @param {{ tone?: "neutral" | "amber" | "sky" | "fuchsia" | "red", as?: any, className?: string, children?: import("react").ReactNode }} props
 */
export default function Chip({ tone = "neutral", as: Tag = "span", className = "", children }) {
  return (
    <Tag className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${TONES[tone]} ${className}`}>
      {children}
    </Tag>
  );
}
