import { Alert, Button } from "../common";

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function LinkRow({ label, href }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1">
        <a href={href} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-amber-300 hover:text-amber-200 hover:underline">
          {href}
        </a>
      </dd>
    </div>
  );
}

/**
 * What the user submitted for a task, with an option to replace it.
 * @param {{ record: import("../../services/taskApi").EvidenceRecord, onResubmit: () => void }} props
 */
export default function EvidenceSummary({ record, onResubmit }) {
  return (
    <div className="space-y-5">
      <Alert tone="success">
        Evidence submitted on {DATE_FORMAT.format(new Date(record.submittedAt))}. It's waiting for review.
      </Alert>
      <dl className="space-y-4">
        <LinkRow label="Project" href={record.repoUrl} />
        {record.demoUrl && <LinkRow label="Live demo" href={record.demoUrl} />}
        {record.files.length > 0 && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Files</dt>
            <dd className="mt-1 text-sm text-slate-300">{record.files.map((f) => f.name).join(", ")}</dd>
          </div>
        )}
        {record.notes && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-line text-sm text-slate-300">{record.notes}</dd>
          </div>
        )}
      </dl>
      <Button variant="outline" size="sm" onClick={onResubmit}>Update submission</Button>
    </div>
  );
}
