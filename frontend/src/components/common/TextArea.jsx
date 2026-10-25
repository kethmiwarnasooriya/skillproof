/** Multi-line counterpart of TextInput, with the same states and error wiring. */
export default function TextArea({ id, error, className = "", ...props }) {
  const state = error
    ? "border-red-500/60 focus:ring-red-500/30"
    : "border-slate-800 focus:border-amber-300/60 focus:ring-amber-300/20";
  return (
    <textarea
      id={id}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full resize-y rounded-xl border bg-slate-900/60 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder-slate-500 outline-none transition focus:ring-2 ${state} ${className}`}
      {...props}
    />
  );
}
