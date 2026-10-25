import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Alert, Button, Field, GlassCard, TextArea, TextInput } from "../components/common";
import SkillsResult from "../components/certificates/SkillsResult";
import { PageShell } from "../components/layout";
import { getErrorCode, getErrorMessage } from "../services/apiClient";
import { submitCertificate } from "../services/certificateApi";

// Kept in line with the backend's CertificateRequest / app.certificates limits
const MIN_PASTED_TEXT = 50;
const MAX_PASTED_TEXT = 20000;
// Error codes where pasting the certificate text is the way forward
const PASTE_FALLBACK_CODES = ["CERTIFICATE_FETCH_FAILED", "ANALYSIS_FAILED"];
const INITIAL = { url: "", certificateText: "" };

type FieldName = keyof typeof INITIAL;
type FieldErrors = Partial<Record<FieldName, string>>;
type Certificate = Parameters<typeof SkillsResult>[0]["certificate"];

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value.trim());
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export default function SubmitCertificate() {
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Certificate | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Bring the error or the result into view; on a long form either can land off-screen
  useEffect(() => {
    if (serverError || result) feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [serverError, result]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as FieldName;
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const next: FieldErrors = {};
    const pasted = formData.certificateText.trim();
    if (!formData.url.trim()) next.url = "Paste the link to your certificate.";
    else if (!isHttpUrl(formData.url)) next.url = "Enter a full link starting with http:// or https://.";
    if (pasted && pasted.length < MIN_PASTED_TEXT) next.certificateText = `Paste at least ${MIN_PASTED_TEXT} characters.`;
    if (pasted.length > MAX_PASTED_TEXT) next.certificateText = `Keep it under ${MAX_PASTED_TEXT.toLocaleString()} characters.`;
    setErrors(next);
    if (next.certificateText) setShowPaste(true);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    setResult(null);
    try {
      setResult(await submitCertificate(formData));
    } catch (err) {
      setServerError(getErrorMessage(err as Error));
      if (PASTE_FALLBACK_CODES.includes(getErrorCode(err))) setShowPaste(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      back={{ to: "/dashboard", label: "Dashboard" }}
      title="Submit a certificate"
      subtitle="Paste the public link to a course certificate. Our AI reads it and lists the skills it covers."
    >
        <GlassCard className="sp-card mt-10 rounded-3xl p-6 md:p-8">
          <div ref={serverError ? feedbackRef : undefined} className="scroll-mt-28">
            {serverError && <Alert className="mb-6" onDismiss={() => setServerError("")}>{serverError}</Alert>}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field id="url" label="Certificate link" error={errors.url}>
              <TextInput
                id="url" name="url" type="url" inputMode="url" autoComplete="url"
                value={formData.url} onChange={handleChange} error={errors.url}
                placeholder="https://www.coursera.org/account/accomplishments/verify/..."
                disabled={loading}
              />
            </Field>

            <div>
              <button
                type="button"
                onClick={() => setShowPaste((open) => !open)}
                aria-expanded={showPaste}
                aria-controls="paste-panel"
                className="flex items-center gap-2 text-sm font-medium text-amber-300 hover:text-amber-200"
              >
                <span aria-hidden="true" className={`transition-transform ${showPaste ? "rotate-90" : ""}`}>›</span>
                Page won't load? Paste the certificate text instead
              </button>

              {showPaste && (
                <div id="paste-panel" className="mt-3">
                  <Field id="certificateText" label="Certificate text (optional)" error={errors.certificateText}>
                    <TextArea
                      id="certificateText" name="certificateText" rows={7}
                      value={formData.certificateText} onChange={handleChange} error={errors.certificateText}
                      placeholder="Copy everything visible on the certificate page: course name, issuer, description..."
                      maxLength={MAX_PASTED_TEXT}
                      disabled={loading}
                    />
                  </Field>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Some sites (Coursera, Udemy) block automatic reading. If you paste text, we use it instead of the page.
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" loading={loading} loadingText="Analysing certificate..." className="w-full text-sm">
              Analyse certificate
            </Button>
            {loading && (
              <p role="status" className="text-center text-xs text-slate-500">This usually takes 5 to 20 seconds.</p>
            )}
          </form>
        </GlassCard>

        {result && (
          <div ref={feedbackRef} className="mt-8 scroll-mt-28">
            <SkillsResult certificate={result}>
              {result.status === "ANALYZED" && (
                // The id in the URL lets the Task Hub reload the skills; the state renders them instantly
                <Button to={`/tasks?certificate=${result.id}`} state={{ certificate: result }} className="text-sm">
                  Proceed to Skill Tasks <span aria-hidden="true">→</span>
                </Button>
              )}
            </SkillsResult>
          </div>
        )}
    </PageShell>
  );
}
