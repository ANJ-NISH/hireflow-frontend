import { useState, type FormEvent } from "react";
import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { setAuth } from "../lib/auth";

type Role = "CANDIDATE" | "RECRUITER";

// Base URL for your Express backend — set VITE_API_URL in a .env file at your frontend root
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("CANDIDATE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // required so the browser accepts the httpOnly refreshToken cookie
        body: JSON.stringify({ role, name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle Zod field errors (400) or duplicate email (409) from the backend
        if (data.errors) {
          const firstError = Object.values(data.errors).flat()[0];
          setErrorMessage((firstError as string) || data.message);
        } else {
          setErrorMessage(data.message || "Something went wrong. Please try again.");
        }
        return;
      }

      // Success — the refreshToken cookie is already set by the browser automatically.
      // setAuth stores the access token in memory and the user in localStorage.
      const { accessToken, user } = data.data;
      setAuth(accessToken, user);

      navigate("/");
    } catch (err) {
      setErrorMessage("Could not reach the server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="It takes less than a minute."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Role toggle */}
        <div>
          <span className="mb-2 block text-sm font-medium text-ink">I am a</span>
          <div className="grid grid-cols-2 gap-3">
            {(["CANDIDATE", "RECRUITER"] as Role[]).map((option) => {
              const isActive = role === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-line bg-white text-ink-soft hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      isActive ? "border-primary" : "border-line"
                    }`}
                  >
                    {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </span>
                  {option === "CANDIDATE" ? "Candidate" : "Recruiter"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Name */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Blake"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>

        {/* Email */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>

        {/* Password */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Password</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
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

        {/* Error message */}
        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-deep disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-deep">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}