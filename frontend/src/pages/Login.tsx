import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Field, PasswordInput, TextInput } from "../components/common";
import { AuthLayout } from "../components/layout";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/apiClient";
import { loginUser } from "../services/authService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL = { email: "", password: "" };
const DEFAULT_REDIRECT = "/dashboard";

type FieldName = keyof typeof INITIAL;
type FieldErrors = Partial<Record<FieldName, string>>;

export default function Login() {
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // ProtectedRoute sends users here with the page they wanted; return them there afterwards
  const redirectTo = (location.state as { from?: string } | null)?.from ?? DEFAULT_REDIRECT;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as FieldName;
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const bind = (name: FieldName) => ({ id: name, name, value: formData[name], onChange: handleChange, error: errors[name] });

  const validate = () => {
    const next: FieldErrors = {};
    if (!EMAIL_RE.test(formData.email)) next.email = "Enter a valid email address.";
    if (!formData.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      signIn(await loginUser(formData));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err as Error));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue building your proof."
      footer={<>New to SkillProof?{" "}
        <Link to="/register" className="font-medium text-amber-300 hover:text-amber-200 hover:underline">Create an account</Link></>}
    >
      {serverError && <Alert className="mt-6" onDismiss={() => setServerError("")}>{serverError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Field id="email" label="Email address" error={errors.email}>
          <TextInput {...bind("email")} type="email" autoComplete="email" placeholder="you@example.com" />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <PasswordInput {...bind("password")} autoComplete="current-password" placeholder="Your password" />
        </Field>
        <Button type="submit" loading={loading} loadingText="Signing in..." className="mt-2 w-full text-sm">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
