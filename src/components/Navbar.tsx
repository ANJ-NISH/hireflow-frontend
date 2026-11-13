import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, logout, getUser, type StoredUser } from "../lib/auth";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { label: "Find jobs", href: "#jobs" },
  { label: "For recruiters", href: "#recruiters" },
  { label: "How it works", href: "#pipeline" },
];

const recruiterMenuLinks = [
  { label: "Company profile", to: "/recruiter/company" },
  { label: "My jobs", to: "/recruiter/jobs" },
  { label: "Post a job", to: "/recruiter/jobs/new" },
  { label: "Search candidates", to: "/recruiter/candidates/search" },
];

const candidateMenuLinks = [
  { label: "My profile", to: "/candidate/profile" },
  { label: "Saved jobs", to: "/candidate/saved-jobs" },
  { label: "My applications", to: "/candidate/applications" },
];

const adminMenuLinks = [
  { label: "Dashboard", to: "/admin" },
  { label: "Users", to: "/admin/users" },
  { label: "Companies", to: "/admin/companies" },
  { label: "Jobs", to: "/admin/jobs" },
  { label: "Complaints", to: "/admin/complaints" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggedIn(false);
    setUser(null);
    setLoggingOut(false);
    setOpen(false);
    setProfileMenuOpen(false);
    navigate("/");
  };

  const isRecruiter = loggedIn && user?.role === "RECRUITER";
  const isCandidate = loggedIn && user?.role === "CANDIDATE";
  const isAdmin = loggedIn && user?.role === "ADMIN";
  const hasProfileMenu = isRecruiter || isCandidate || isAdmin;
  const profileMenuLinks = isRecruiter
    ? recruiterMenuLinks
    : isCandidate
    ? candidateMenuLinks
    : isAdmin
    ? adminMenuLinks
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-white">
            H
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            HireFlow
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {loggedIn && <NotificationBell />}

          <div className="hidden items-center gap-3 md:flex">
            {hasProfileMenu ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  aria-label="Open profile menu"
                  aria-expanded={profileMenuOpen}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary transition-colors hover:bg-primary/20"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-white p-2 shadow-lg shadow-ink/10">
                    {user && (
                      <div className="border-b border-line px-3 py-2">
                        <p className="text-sm font-semibold text-ink">{user.name}</p>
                        <p className="text-xs text-ink-soft">{user.email}</p>
                      </div>
                    )}

                    <nav className="mt-1 flex flex-col">
                      {profileMenuLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setProfileMenuOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>

                    <div className="mt-1 border-t border-line pt-1">
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-60"
                      >
                        {loggingOut ? "Logging out…" : "Log out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : loggedIn ? (
              <>
                {user && (
                  <span className="text-sm font-medium text-ink-soft">
                    Hi, {user.name.split(" ")[0]}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-primary">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:bg-primary-deep"
                >
                  Create free account
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-ink-soft"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {hasProfileMenu ? (
              <>
                <div className="border-t border-line pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/60">
                    {isRecruiter ? "Recruiter" : isAdmin ? "Admin" : "Candidate"}
                  </p>
                  {profileMenuLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="mt-2 block text-sm font-medium text-ink-soft"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-full border border-line px-5 py-2.5 text-center text-sm font-semibold text-red-500 disabled:opacity-60"
                >
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
              </>
            ) : loggedIn ? (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-full border border-line px-5 py-2.5 text-center text-sm font-semibold text-ink-soft disabled:opacity-60"
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-ink-soft" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Create free account
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}