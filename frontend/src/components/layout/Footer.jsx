import { Link } from "react-router-dom";
import { Logo } from "../common";
import { NAV_LINKS } from "../../constants/content";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <Logo />
        <ul className="flex flex-wrap gap-6 text-sm text-slate-400">
          {NAV_LINKS.map((n) => <li key={n.to}><Link to={n.to} className="hover:text-amber-300">{n.label}</Link></li>)}
        </ul>
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} SkillProof</p>
      </div>
    </footer>
  );
}
