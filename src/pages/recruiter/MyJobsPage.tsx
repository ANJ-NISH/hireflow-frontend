import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyJobs, publishJob, pauseJob, closeJob, deleteJob, type Job, type JobStatus } from "../../lib/api/job";
import Navbar from "../../components/Navbar";

const STATUS_STYLES: Record<JobStatus, string> = {
  DRAFT: "bg-surface text-ink-soft",
  PUBLISHED: "bg-emerald-50 text-success",
  PAUSED: "bg-amber-50 text-accent",
  CLOSED: "bg-red-50 text-red-500",
};

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadJobs = () => {
    setLoading(true);
    listMyJobs()
      .then(({ jobs }) => setJobs(jobs))
      .catch((err) => setErrorMessage(err.message || "Could not load jobs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const runAction = async (id: string, action: (id: string) => Promise<{ job: Job }>) => {
    setBusyJobId(id);
    setErrorMessage(null);
    try {
      const { job } = await action(id);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
    } catch (err: any) {
      setErrorMessage(err.message || "Action failed");
    } finally {
      setBusyJobId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job permanently?")) return;
    setBusyJobId(id);
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || "Could not delete job");
    } finally {
      setBusyJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Recruiter dashboard
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              My job posts
            </h1>
          </div>
          <Link
            to="/recruiter/jobs/new"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep"
          >
            Post a job
          </Link>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-ink-soft">Loading…</p>
        ) : jobs.length === 0 ? (
          <p className="mt-10 text-sm text-ink-soft">You haven't posted any jobs yet.</p>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {jobs.map((job) => {
              const isBusy = busyJobId === job.id;
              return (
                <div key={job.id} className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-base font-semibold text-ink">{job.title}</h3>
                      <p className="mt-1 text-sm text-ink-soft">
                        {job.location} · {job.workMode} · {job.employmentType}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[job.status]}`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    {job.status === "DRAFT" && (
                      <button
                        disabled={isBusy}
                        onClick={() => runAction(job.id, publishJob)}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
                      >
                        Publish
                      </button>
                    )}
                    {job.status === "PUBLISHED" && (
                      <button
                        disabled={isBusy}
                        onClick={() => runAction(job.id, pauseJob)}
                        className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft hover:border-primary hover:text-primary disabled:opacity-60"
                      >
                        Pause
                      </button>
                    )}
                    {job.status === "PAUSED" && (
                      <button
                        disabled={isBusy}
                        onClick={() => runAction(job.id, publishJob)}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
                      >
                        Resume
                      </button>
                    )}
                    {job.status !== "CLOSED" && (
                      <button
                        disabled={isBusy}
                        onClick={() => runAction(job.id, closeJob)}
                        className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft hover:border-primary hover:text-primary disabled:opacity-60"
                      >
                        Close
                      </button>
                    )}
                    <button
                      disabled={isBusy}
                      onClick={() => handleDelete(job.id)}
                      className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-300 disabled:opacity-60"
                    >
                      Delete
                    </button>

                    <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft hover:border-primary hover:text-primary"
                  >
                    View applicants
                  </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}