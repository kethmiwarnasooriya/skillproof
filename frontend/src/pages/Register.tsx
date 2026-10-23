import { useState, type ChangeEvent, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { Alert, Field, GlassCard, Logo, PasswordInput, TextInput } from "../components/common";

import { STEPS } from "../constants/content";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL = { fullName: "", email: "", password: "", confirmPassword: "" };

type FieldName = keyof typeof INITIAL;
type FieldErrors = Partial<Record<FieldName, string>>;

import { registerUser } from "../services/authService";

function Showcase() {
  return (
    <div className="relative hidden flex-1 flex-col justify-between p-12 lg:flex">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
          Turn certificates into proof you can do the work.
        </h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-400">
          Create your account to start building a record employers can trust.
        </p>
        <ol className="mt-10 space-y-3">
          {STEPS.map((s, i) => (
            <GlassCard as="li" key={s.title} className="flex items-start gap-4 rounded-2xl p-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-300/15 text-sm font-semibold text-amber-300">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-slate-100">{s.title}</p>
                <p className="text-sm text-slate-400">{s.short}</p>
              </div>
            </GlassCard>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function Register() {
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as FieldName;
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  /** Props shared by every control: id, name, value, onChange, error. */
  const bind = (name: FieldName) => ({ id: name, name, value: formData[name], onChange: handleChange, error: errors[name] });

  const validate = () => {
    const next: FieldErrors = {};
    if (!formData.fullName.trim()) next.fullName = "Enter your full name.";
    if (!EMAIL_RE.test(formData.email)) next.email = "Enter a valid email address.";
    if (formData.password.length < 8) next.password = "Use at least 8 characters.";
    else if (formData.password.length > 40) next.password = "Use at most 40 characters.";
    if (formData.confirmPassword !== formData.password) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log("1. Form submission triggered:", formData);

  const isValid = validate();
  console.log("2. Validation result:", isValid, errors);

  if (!isValid) {
    console.warn("Client-side validation failed!");
    return;
  }

  setLoading(true);
  setServerError("");

  try {
    const { fullName, email, password } = formData;
    console.log("3. Sending request to backend via authService...");
    
    const response = await registerUser({ fullName, email, password });
    console.log("4. Backend responded successfully:", response);

    setSuccess(true);
  } catch (err) {
    console.error("5. Network/API Error caught:", err);
    const message = isAxiosError(err) ? err.response?.data?.message : undefined;
    setServerError(message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="sp-page sp-page-scene flex min-h-screen font-sans text-slate-100">
      <Showcase />
      <main className="sp-formcol flex items-center justify-center px-5 py-10 lg:shrink-0 lg:px-10">
        <GlassCard className="sp-card w-full max-w-md rounded-3xl p-8">
          <Logo size="sm" className="mb-6 lg:hidden" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>
          <p className="mt-1.5 text-sm text-slate-400">It takes less than a minute.</p>

          {serverError && <Alert className="mt-6" onDismiss={() => setServerError("")}>{serverError}</Alert>}
          {success && <Alert tone="success" className="mt-6">Account created. You can now sign in.</Alert>}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <Field id="fullName" label="Full name" error={errors.fullName}>
              <TextInput {...bind("fullName")} type="text" autoComplete="name" placeholder="John Doe" />
            </Field>
            <Field id="email" label="Email address" error={errors.email}>
              <TextInput {...bind("email")} type="email" autoComplete="email" placeholder="you@example.com" />
            </Field>
            <Field id="password" label="Password" error={errors.password}>
              <PasswordInput {...bind("password")} autoComplete="new-password" placeholder="At least 8 characters" />
            </Field>
            <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
              <PasswordInput {...bind("confirmPassword")} autoComplete="new-password" placeholder="Re-enter your password" />
            </Field>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-amber-300 hover:text-amber-200 hover:underline">Sign In</a>
          </p>
        </GlassCard>
      </main>
    </div>
  );
}
