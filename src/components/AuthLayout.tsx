import type { ReactNode } from "react";

const highlights = [
  "See every application move through one clear pipeline",
  "Get matched to roles based on your real skills",
  "Recruiters respond faster when the process is this clean",
];

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen font-body">
      {/* Brand panel — hidden on small screens */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-ink px-10 py-12 text-white lg:flex">
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -top-16 right-[-4rem] h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

        <a href="/" className="relative flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-white">
            H
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            HireFlow
          </span>
        </a>

        <div className="relative">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Applied → Screening → Shortlisted → Interview → Offered → Hired
          </p>
          <h2 className="mt-4 max-w-sm font-display text-3xl font-semibold leading-tight tracking-tight">
            Your next role is one application away.
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {highlights.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-white/70">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-accent">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} HireFlow. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 items-center justify-center bg-paper px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <a href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-white">
              H
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              HireFlow
            </span>
          </a>

          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
