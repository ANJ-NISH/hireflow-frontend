import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JobCard from "./JobCard";
import { isLoggedIn, getUser } from "../lib/auth";
import { listRecentlyViewed, type RecentlyViewedJob } from "../lib/api/recentlyViewed";
import { toJobCardJob } from "../lib/jobFormat";

export default function RecentlyViewedStrip() {
  const isCandidate = isLoggedIn() && getUser()?.role === "CANDIDATE";
  const [items, setItems] = useState<RecentlyViewedJob[]>([]);

  useEffect(() => {
    if (!isCandidate) return;
    listRecentlyViewed(3)
      .then(({ recentlyViewed }) => setItems(recentlyViewed))
      .catch(() => {});
  }, [isCandidate]);

  if (!isCandidate || items.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink">Recently viewed</h2>
        <Link
          to="/candidate/recently-viewed"
          className="text-sm font-semibold text-primary hover:text-primary-deep"
        >
          View all →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <JobCard key={item.id} job={toJobCardJob(item.job)} />
        ))}
      </div>
    </section>
  );
}