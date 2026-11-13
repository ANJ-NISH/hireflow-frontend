import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isLoggedIn, getUser } from "../lib/auth";

const candidatePoints = [
  "Track every application's exact stage, from applied to hired",
  "Save jobs and get notified before they close",
  "See which of your skills match each role",
];

const recruiterPoints = [
  "Post a job and start reviewing candidates in minutes",
  "Move applicants through one clear pipeline with your team",
  "Search candidates by skill and years of experience",
];

export default function AudienceSplit() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER" | "ADMIN" | null>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setRole(getUser()?.role ?? null);
  }, []);

  const isCandidate = loggedIn && role === "CANDIDATE";
  const isRecruiter = loggedIn && role === "RECRUITER";

  // Candidates already logged in should jump straight to browsing jobs, not sign up again
  const candidateHref = isCandidate ? "#jobs" : "/register";
  const candidateLabel = isCandidate ? "Browse open roles" : "Find your next role";

  // Recruiters already logged in should go straight to posting, not sign up again
  const recruiterHref = isRecruiter ? "/recruiter/jobs/new" : "/register";
  const recruiterLabel = isRecruiter ? "Post a job" : "Post a job";

  return (
    <section id="recruiters" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-8">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            For candidates
          </span>
          <h3 className="mt-3 font-display text-xl font-semibold text-ink md:text-2xl">
            Apply with confidence, not guesswork
          </h3>
          <ul className="mt-6 flex flex-col gap-4">
            {candidatePoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-ink-soft">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-primary">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
          {candidateHref.startsWith("#") ? (
            <a
              href={candidateHref}
              className="mt-8 inline-block rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary-soft"
            >
              {candidateLabel}
            </a>
          ) : (
            <Link
              to={candidateHref}
              className="mt-8 inline-block rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary-soft"
            >
              {candidateLabel}
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-ink p-8 text-white">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            For recruiters
          </span>
          <h3 className="mt-3 font-display text-xl font-semibold md:text-2xl">
            Hire faster with less admin
          </h3>
          <ul className="mt-6 flex flex-col gap-4">
            {recruiterPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-white/70">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-accent">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {point}
              </li>
            ))}
          </ul>

          {isCandidate ? (
            <div className="mt-8">
              <p className="text-sm text-white/60">
                You're logged in as a candidate — recruiter tools need a recruiter account.
              </p>
              <Link
                to="/login"
                className="mt-3 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink hover:bg-accent/90"
              >
                Log in with a recruiter account
              </Link>
            </div>
          ) : (
            <Link
              to={recruiterHref}
              className="mt-8 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink hover:bg-accent/90"
            >
              {recruiterLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}