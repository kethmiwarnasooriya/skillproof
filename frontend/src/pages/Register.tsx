import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Field, PasswordInput, TextInput } from "../components/common";
import { AuthLayout } from "../components/layout";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/apiClient";
import { registerUser } from "../services/authService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL = { fullName: "", email: "", password: "", confirmPassword: "" };

type FieldName = keyof typeof INITIAL;
type FieldErrors = Partial<Record<FieldName, string>>;

export default function Register() {
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

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
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      const { fullName, email, password } = formData;
      // Register returns a JWT, so the new user is signed in straight away
      signIn(await registerUser({ fullName, email, password }));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err as Error));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={<>Already have an account?{" "}
        <Link to="/login" className="font-medium text-amber-300 hover:text-amber-200 hover:underline">Sign in</Link></>}
    >
      {serverError && <Alert className="mt-6" onDismiss={() => setServerError("")}>{serverError}</Alert>}

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
        <Button type="submit" loading={loading} loadingText="Creating account..." className="mt-2 w-full text-sm">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
