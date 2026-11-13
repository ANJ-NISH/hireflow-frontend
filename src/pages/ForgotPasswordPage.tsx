import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { forgotPassword } from "../lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await forgotPassword(email);
      setSubmitted(true); // backend always returns success regardless of whether the email exists
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Reset your password"
      title="Forgot password"
      subtitle="We'll email you a link to reset it."
    >
      {submitted ? (
        <div>
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-success">
            If an account with that email exists, a reset link has been sent.
          </p>
          <Link to="/login" className="mt-5 inline-block text-sm font-semibold text-primary hover:text-primary-deep">
            ← Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>

          <p className="text-center text-sm text-ink-soft">
            Remembered your password?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-deep">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}