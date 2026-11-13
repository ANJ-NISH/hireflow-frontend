import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import JobCard from "../../components/JobCard";
import { listSavedJobs, type SavedJob } from "../../lib/api/savedJob";
import { toJobCardJob } from "../../lib/jobFormat";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    listSavedJobs()
      .then(({ savedJobs }) => setSavedJobs(savedJobs))
      .catch((err) => setErrorMessage(err.message || "Could not load saved jobs"))
      .finally(() => setLoading(false));
  }, []);

  // Called by JobCard right after a successful unsave — removes the card
  // from view immediately, without waiting for a page refresh or refetch.
  const handleSaveToggle = (jobId: string, saved: boolean) => {
    if (!saved) {
      setSavedJobs((prev) => prev.filter((s) => s.jobId !== jobId));
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Bookmarked
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Saved jobs
        </h1>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-ink-soft">Loading…</p>
        ) : savedJobs.length === 0 ? (
          <div className="mt-10 text-sm text-ink-soft">
            You haven't saved any jobs yet.{" "}
            <Link to="/jobs" className="font-semibold text-primary hover:text-primary-deep">
              Browse jobs →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedJobs.map((saved) => (
              <JobCard
                key={saved.id}
                job={toJobCardJob(saved.job)}
                initialSaved={true}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}