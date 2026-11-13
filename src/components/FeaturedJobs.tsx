import { useEffect, useState } from "react";
import JobCard, { type Job as JobCardJob } from "./JobCard";
import { searchJobs } from "../lib/api/job";
import { toJobCardJob } from "../lib/jobFormat";

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<JobCardJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    searchJobs({ limit: 6, page: 1 })
      .then(({ jobs }) => setJobs(jobs.map(toJobCardJob)))
      .catch((err) => setErrorMessage(err.message || "Could not load jobs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="jobs" className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Live openings
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Roles moving right now
          </h2>
        </div>
        <a href="/jobs" className="text-sm font-semibold text-primary hover:text-primary-deep">
          View all jobs →
        </a>
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-ink-soft">Loading jobs…</p>
      ) : errorMessage ? (
        <p className="mt-10 text-sm text-ink-soft">Could not load jobs right now — check back soon.</p>
      ) : jobs.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">No jobs posted yet — check back soon.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}