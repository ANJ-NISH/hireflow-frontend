import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { verifyEmail, resendVerification } from "../lib/api/auth";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setErrorMessage("This verification link is missing required information.");
      return;
    }

    verifyEmail(email, token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.message || "This link is invalid or has expired.");
      });
  }, [email, token]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification(email);
      setResent(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Almost there"
      title="Email verification"
      subtitle=""
    >
      {status === "verifying" && (
        <p className="text-sm text-ink-soft">Verifying your email…</p>
      )}

      {status === "success" && (
        <div>
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-success">
            Your email has been verified.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-deep"
          >
            Continue to log in
          </Link>
        </div>
      )}

      {status === "error" && (
        <div>
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</p>

          {email && !resent && (
            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-5 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend verification email"}
            </button>
          )}

          {resent && (
            <p className="mt-5 text-sm text-ink-soft">
              If that email exists and isn't verified yet, a new link is on its way.
            </p>
          )}
        </div>
      )}
    </AuthLayout>
  );
}