import { useState } from "react";
import { Alert, Button, Field, FileDropzone, TextArea, TextInput } from "../common";
import { submitEvidence } from "../../services/taskApi";

const MAX_NOTES = 2000;
const INITIAL = { repoUrl: "", demoUrl: "", notes: "" };

function isHttpUrl(value) {
  try {
    const { protocol } = new URL(value.trim());
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function validate({ repoUrl, demoUrl, notes }) {
  const errors = {};
  if (!repoUrl.trim()) errors.repoUrl = "Add a link to your repository or project.";
  else if (!isHttpUrl(repoUrl)) errors.repoUrl = "Enter a full link starting with http:// or https://.";
  if (demoUrl.trim() && !isHttpUrl(demoUrl)) errors.demoUrl = "Enter a full link starting with http:// or https://.";
  if (notes.length > MAX_NOTES) errors.notes = `Keep notes under ${MAX_NOTES} characters.`;
  return errors;
}

/**
 * Evidence for one task: project link, optional demo link, screenshots and notes.
 * @param {{ task: { id: string, certificateId: number },
 *   onSubmitted: (record: import("../../services/taskApi").EvidenceRecord) => void }} props
 */
export default function EvidenceForm({ task, onSubmitted }) {
  const [formData, setFormData] = useState(INITIAL);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [fileMessage, setFileMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const bind = (name) => ({ id: name, name, value: formData[name], onChange: handleChange, error: errors[name], disabled: submitting });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate(formData);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      onSubmitted(await submitEvidence(task, { ...formData, files }));
    } catch (err) {
      setServerError(err.message || "Couldn't submit your evidence. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && <Alert onDismiss={() => setServerError("")}>{serverError}</Alert>}

      <Field id="repoUrl" label="GitHub repository or project link" error={errors.repoUrl}>
        <TextInput {...bind("repoUrl")} type="url" inputMode="url" placeholder="https://github.com/you/project" />
      </Field>

      <Field id="demoUrl" label="Live demo link (optional)" error={errors.demoUrl}>
        <TextInput {...bind("demoUrl")} type="url" inputMode="url" placeholder="https://your-project.vercel.app" />
      </Field>

      <Field id="evidenceFiles" label="Screenshots or files (optional)" error={fileMessage}>
        <FileDropzone
          id="evidenceFiles" files={files} disabled={submitting} error={fileMessage}
          onChange={(next) => { setFiles(next); setFileMessage(""); }}
          onReject={setFileMessage}
        />
      </Field>

      <Field id="notes" label="Notes for the reviewer (optional)" error={errors.notes}>
        <TextArea
          {...bind("notes")} rows={5} maxLength={MAX_NOTES}
          placeholder="What did you build, which decisions did you make, and what would you improve?"
        />
      </Field>
      <p className="-mt-3 text-right text-xs text-slate-500">{formData.notes.length}/{MAX_NOTES}</p>

      <Button type="submit" loading={submitting} loadingText="Submitting evidence..." className="w-full text-sm">
        Submit Evidence &amp; Complete Task
      </Button>
    </form>
  );
}
