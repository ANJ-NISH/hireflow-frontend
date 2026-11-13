import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listAllJobs, removeJob, type AdminJob } from "../../lib/api/admin";

const STATUS_STYLES: Record<AdminJob["status"], string> = {
  DRAFT: "bg-surface text-ink-soft",
  PUBLISHED: "bg-emerald-50 text-success",
  PAUSED: "bg-amber-50 text-accent",
  CLOSED: "bg-red-50 text-red-500",
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listAllJobs({ status: status || undefined })
      .then(({ jobs }) => setJobs(jobs))
      .catch((err) => setErrorMessage(err.message || "Could not load jobs"))
      .finally(() => setLoading(false));
  }, [status]);

  const handleRemove = async (id: string) => {
    if (!confirm("Force-close this job? It will be removed from public search.")) return;
    setBusyId(id);
    try {
      await removeJob(id);
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "CLOSED" } : j)));
    } catch (err: any) {
      setErrorMessage(err.message || "Could not remove job");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        <option value="">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="PAUSED">Paused</option>
        <option value="CLOSED">Closed</option>
      </select>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-soft">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-soft">Loading…</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-soft">No jobs found.</td></tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{job.title}</td>
                  <td className="px-4 py-3 text-ink-soft">{job.company.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{job.location}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[job.status]}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {job.status !== "CLOSED" && (
                      <button
                        disabled={busyId === job.id}
                        onClick={() => handleRemove(job.id)}
                        className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-red-500 hover:border-red-300 disabled:opacity-50"
                      >
                        Force close
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}