import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import JobCard from "../../components/JobCard";
import {
  listRecentlyViewed,
  removeRecentlyViewed,
  clearRecentlyViewed,
  type RecentlyViewedJob,
} from "../../lib/api/recentlyViewed";
import { toJobCardJob, formatPostedAgo } from "../../lib/jobFormat";

export default function RecentlyViewedPage() {
  const [items, setItems] = useState<RecentlyViewedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    listRecentlyViewed(20)
      .then(({ recentlyViewed }) => setItems(recentlyViewed))
      .catch((err) => setErrorMessage(err.message || "Could not load your history"))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (jobId: string) => {
    const previous = items;
    setItems((prev) => prev.filter((i) => i.jobId !== jobId)); 
    setErrorMessage(null);
    try {
      await removeRecentlyViewed(jobId);
    } catch (err: any) {
      setItems(previous); 
      setErrorMessage(err.message || "Could not remove this job");
    }
  };

  const handleClear = async () => {
    if (!confirm("Clear your entire viewing history?")) return;
    setClearing(true);
    setErrorMessage(null);
    try {
      await clearRecentlyViewed();
      setItems([]);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not clear your history");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Pick up where you left off
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              Recently viewed
            </h1>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-red-300 hover:text-red-500 disabled:opacity-50"
            >
              {clearing ? "Clearing…" : "Clear history"}
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-ink-soft">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-10 text-sm text-ink-soft">
            Jobs you open will show up here.{" "}
            <Link to="/jobs" className="font-semibold text-primary hover:text-primary-deep">
              Browse jobs →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id}>
                <JobCard job={toJobCardJob(item.job)} />
                <div className="mt-2 flex items-center justify-between px-1 text-xs text-ink-soft">
                  <span>Viewed {formatPostedAgo(item.viewedAt)}</span>
                  <button
                    onClick={() => handleRemove(item.jobId)}
                    className="font-semibold text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}