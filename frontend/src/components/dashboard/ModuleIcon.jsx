const PATHS = {
  certificate: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h4",
  tasks: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  proof: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4",
  review: "M4 5h16v10H8l-4 4zM8 9h8M8 12h5",
};

/**
 * Line icon for a dashboard module.
 * @param {{ name: keyof typeof PATHS, className?: string }} props
 */
export default function ModuleIcon({ name, className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      <path d={PATHS[name] ?? PATHS.certificate} />
    </svg>
  );
}
