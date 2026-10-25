import { useEffect, useId, useRef, useState } from "react";

function formatSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// The object URL is created and revoked in an effect, so it also survives StrictMode's double mount
function ImagePreview({ file }) {
  const imgRef = useRef(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    imgRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <img ref={imgRef} alt={`Preview of ${file.name}`} className="h-full w-full object-cover" />;
}

function FileTile({ file, onRemove, disabled }) {
  const isImage = file.type.startsWith("image/");
  return (
    <li className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <div className="grid aspect-video place-items-center bg-slate-950/60 text-xs font-semibold uppercase tracking-widest text-slate-500">
        {isImage ? <ImagePreview file={file} /> : (file.name.split(".").pop() || "file")}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="min-w-0 truncate text-xs text-slate-300" title={file.name}>{file.name}</p>
        <span className="shrink-0 text-xs text-slate-500">{formatSize(file.size)}</span>
      </div>
      <button
        type="button" onClick={onRemove} disabled={disabled} aria-label={`Remove ${file.name}`}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-slate-950/80 text-slate-300 opacity-90 transition hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
      >
        ✕
      </button>
    </li>
  );
}

/**
 * Drag-and-drop or click-to-browse file picker with image previews. Controlled: the parent owns `files`.
 * Files that break the type, size or count limits are rejected and reported through `onReject`.
 * @param {{ id: string, files: File[], onChange: (files: File[]) => void, onReject?: (message: string) => void,
 *   accept?: string, maxFiles?: number, maxSizeMb?: number, error?: string, disabled?: boolean }} props
 */
export default function FileDropzone({
  id, files, onChange, onReject = () => {}, accept = "image/*,application/pdf", maxFiles = 5, maxSizeMb = 5, error, disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();

  const isAccepted = (file) => accept.split(",").some((rule) => {
    const pattern = rule.trim();
    return pattern.endsWith("/*") ? file.type.startsWith(pattern.slice(0, -1)) : file.type === pattern;
  });

  const addFiles = (incoming) => {
    const valid = [];
    for (const file of incoming) {
      if (!isAccepted(file)) onReject(`${file.name} isn't a supported file type.`);
      else if (file.size > maxSizeMb * 1024 * 1024) onReject(`${file.name} is larger than ${maxSizeMb} MB.`);
      else valid.push(file);
    }
    const room = maxFiles - files.length;
    if (valid.length > room) onReject(`You can attach up to ${maxFiles} files.`);
    if (room > 0 && valid.length) onChange([...files, ...valid.slice(0, room)]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) addFiles(Array.from(e.dataTransfer.files));
  };

  const state = error
    ? "border-red-500/60"
    : dragging ? "border-amber-300/70 bg-amber-300/5" : "border-slate-700 hover:border-amber-300/50";

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border border-dashed bg-slate-900/40 px-4 py-6 text-center transition ${state}`}
      >
        <input
          ref={inputRef} id={id} type="file" multiple accept={accept} disabled={disabled} className="sr-only"
          aria-describedby={error ? `${id}-error ${hintId}` : hintId} aria-invalid={!!error}
          onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }}
        />
        <p className="text-sm text-slate-300">
          Drag screenshots here or{" "}
          <button
            type="button" onClick={() => inputRef.current.click()} disabled={disabled}
            className="font-medium text-amber-300 hover:text-amber-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
          >
            browse files
          </button>
        </p>
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          Images or PDF, up to {maxSizeMb} MB each, {maxFiles} files max ({files.length}/{maxFiles} added)
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((file, index) => (
            <FileTile
              key={`${file.name}-${file.size}-${file.lastModified}`} file={file} disabled={disabled}
              onRemove={() => onChange(files.filter((_, i) => i !== index))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
