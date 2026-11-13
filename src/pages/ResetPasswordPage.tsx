import { useState, type FormEvent } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { resetPassword } from "../lib/api/auth";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const missingParams = !email || !token;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email, token, newPassword);
      setSuccess(true);
      // A reset revokes every session server-side, so send them to log in with the new password
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "This link is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Almost done"
      title="Set a new password"
      subtitle=""
    >
      {missingParams ? (
        <div>
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            This reset link is missing required information.
          </p>
          <Link to="/forgot-password" className="mt-5 inline-block text-sm font-semibold text-primary hover:text-primary-deep">
            Request a new link →
          </Link>
        </div>
      ) : success ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-success">
          Password reset. Redirecting you to log in…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">New password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 pr-11 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-primary"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-6 0-10-6-10-8a17.9 17.9 0 0 1 4.22-5.44M9.9 4.24A9.98 9.98 0 0 1 12 4c6 0 10 6 10 8a17.9 17.9 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Confirm new password</span>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
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
            {submitting ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}