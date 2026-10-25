/**
 * Frosted-glass surface. Pass rounding/padding via className; `as` changes the tag or component (e.g. a router Link).
 * @param {{ as?: import("react").ElementType, className?: string, children?: import("react").ReactNode, [key: string]: any }} props
 */
export default function GlassCard({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag className={`border border-slate-800 bg-slate-900/50 backdrop-blur-xl ${className}`} {...props}>
      {children}
    </Tag>
  );
}
