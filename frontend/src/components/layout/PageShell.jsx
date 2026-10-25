import { Link } from "react-router-dom";

/**
 * Shared frame for signed-in pages: background, spacing below the fixed navbar, optional back link and heading.
 * @param {{ title?: import("react").ReactNode, subtitle?: import("react").ReactNode, back?: { to: string, label: string },
 *   width?: "md" | "lg", children?: import("react").ReactNode }} props
 */
export default function PageShell({ title, subtitle, back, width = "md", children }) {
  return (
    <div className="sp-page sp-page-home min-h-screen px-5 pb-24 pt-32 font-sans text-slate-100 md:pt-40">
      <main className={`mx-auto ${width === "lg" ? "max-w-6xl" : "max-w-2xl"}`}>
        {back && (
          <Link to={back.to} className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-amber-300">
            <span aria-hidden="true">←</span> {back.label}
          </Link>
        )}
        {title && <h1 className="sp-fade text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h1>}
        {subtitle && (
          <p className="sp-fade mt-3 max-w-xl text-slate-400" style={{ animationDelay: ".1s" }}>{subtitle}</p>
        )}
        {children}
      </main>
    </div>
  );
}
