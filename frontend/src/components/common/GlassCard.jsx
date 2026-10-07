/** Frosted-glass surface. Pass rounding/padding via className; `as` changes the tag. */
export default function GlassCard({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag className={`border border-slate-800 bg-slate-900/50 backdrop-blur-xl ${className}`} {...props}>
      {children}
    </Tag>
  );
}
