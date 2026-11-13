import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { saveJob, unsaveJob, checkIfSaved } from "../lib/api/savedJob";
import { isLoggedIn, getUser } from "../lib/auth";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  employmentType: string;
  salary: string;
  skills: string[];
  postedAgo: string;
};

export default function JobCard({
  job,
  initialSaved,
  onSaveToggle,
}: {
  job: Job;
  initialSaved?: boolean; // lets a parent that already knows saved-state skip the check call
  onSaveToggle?: (jobId: string, saved: boolean) => void; // fires right after a successful save/unsave
}) {
  const [saved, setSaved] = useState(initialSaved ?? false);
  const [busy, setBusy] = useState(false);

  const isCandidate = isLoggedIn() && getUser()?.role === "CANDIDATE";

  useEffect(() => {
    // Skip the network check entirely when the parent already told us the saved state
    if (!isCandidate || initialSaved !== undefined) return;
    checkIfSaved(job.id)
      .then(({ isSaved }) => setSaved(isSaved))
      .catch(() => {});
  }, [job.id]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCandidate || busy) return;

    setBusy(true);
    try {
      if (saved) {
        await unsaveJob(job.id);
        setSaved(false);
        onSaveToggle?.(job.id, false);
      } else {
        await saveJob(job.id);
        setSaved(true);
        onSaveToggle?.(job.id, true);
      }
    } catch {
      // leave state unchanged on failure
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link to={`/jobs/${job.id}`} className="block">
      <article className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-ink/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft font-display text-sm font-semibold text-primary">
              {job.company.charAt(0)}
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-ink">
                {job.title}
              </h3>
              <p className="text-sm text-ink-soft">{job.company}</p>
            </div>
          </div>

          {isCandidate && (
            <button
              type="button"
              aria-label={saved ? "Remove from saved jobs" : "Save job"}
              onClick={handleToggleSave}
              disabled={busy}
              className={`transition-colors disabled:opacity-50 ${saved ? "text-accent" : "text-ink-soft hover:text-accent"}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {job.location}
          </span>
          <span>{job.workMode}</span>
          <span>{job.employmentType}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="font-mono text-sm font-semibold text-ink">{job.salary}</span>
          <span className="text-xs text-ink-soft">{job.postedAgo}</span>
        </div>
      </article>
    </Link>
  );
}