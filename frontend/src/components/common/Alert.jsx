const TONES = {
  error: "border-red-500/30 bg-red-500/10 text-red-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

/**
 * @param {{ tone?: "error" | "success", onDismiss?: () => void, className?: string, children?: import("react").ReactNode }} props
 */
export default function Alert({ tone = "error", onDismiss, className = "", children }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${TONES[tone]} ${className}`}>
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="opacity-70 hover:opacity-100">✕</button>
      )}
    </div>
  );
}
