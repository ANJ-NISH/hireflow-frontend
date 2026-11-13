import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import Navbar from "./Navbar";

const tabs = [
  { label: "Overview", to: "/admin" },
  { label: "Users", to: "/admin/users" },
  { label: "Companies", to: "/admin/companies" },
  { label: "Jobs", to: "/admin/jobs" },
  { label: "Complaints", to: "/admin/complaints" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Admin
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Platform administration
        </h1>

        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-ink-soft hover:text-primary"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}