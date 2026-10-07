export default function Logo({ size = "md", href = "/", className = "" }) {
  const box = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <a href={href} className={`flex items-center gap-2 text-lg font-semibold text-white ${className}`}>
      <span className={`grid ${box} place-items-center rounded-lg bg-amber-300 text-sm font-bold text-slate-900`}>S</span>
      SkillProof
    </a>
  );
}
