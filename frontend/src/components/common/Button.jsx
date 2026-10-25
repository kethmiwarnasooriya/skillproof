import { Link } from "react-router-dom";
import Spinner from "./Spinner";

const VARIANTS = {
  primary: "sp-btn-glow bg-amber-300 font-semibold text-slate-900 hover:bg-amber-200",
  outline: "border border-slate-600 font-medium text-slate-200 hover:border-amber-300/60 hover:text-amber-300",
};
const SIZES = { sm: "px-5 py-2 text-sm", md: "px-7 py-3" };

/**
 * Renders a router <Link> when `to` is given (in-app pages), <a> when `href` is given, otherwise <button>.
 * @param {{ variant?: "primary" | "outline", size?: "sm" | "md", to?: string | object, state?: any, href?: string, loading?: boolean, loadingText?: import("react").ReactNode, className?: string, children?: import("react").ReactNode, [key: string]: any }} props
 */
export default function Button({
  variant = "primary", size = "md", to, href, loading = false, loadingText, className = "", children, ...props
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-70 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...props}>{children}</a>;
  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {loading ? (<><Spinner /> {loadingText ?? children}</>) : children}
    </button>
  );
}
