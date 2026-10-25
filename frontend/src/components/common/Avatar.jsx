const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };

/** "Kethmi Mithara" -> "KM"; single names give one letter. */
function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/**
 * Round initials badge for a user.
 * @param {{ name?: string, size?: "sm" | "md" | "lg", className?: string }} props
 */
export default function Avatar({ name = "", size = "md", className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full border border-amber-300/40 bg-amber-300/15 font-semibold text-amber-200 ${SIZES[size]} ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
