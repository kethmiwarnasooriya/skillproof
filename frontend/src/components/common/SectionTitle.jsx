export default function SectionTitle({ as: Tag = "h2", className = "", children }) {
  return <Tag className={`max-w-lg text-3xl font-bold tracking-tight text-white md:text-4xl ${className}`}>{children}</Tag>;
}
