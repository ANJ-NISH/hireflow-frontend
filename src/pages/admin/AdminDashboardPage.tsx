import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getStats, type AdminStats } from "../../lib/api/admin";

const STAT_CARDS: { key: keyof AdminStats; label: string }[] = [
  { key: "totalUsers", label: "Total users" },
  { key: "totalCandidates", label: "Candidates" },
  { key: "totalRecruiters", label: "Recruiters" },
  { key: "totalCompanies", label: "Companies" },
  { key: "pendingCompanies", label: "Pending approval" },
  { key: "totalJobs", label: "Total jobs" },
  { key: "publishedJobs", label: "Published jobs" },
  { key: "totalApplications", label: "Applications" },
  { key: "openComplaints", label: "Open complaints" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setErrorMessage(err.message || "Could not load stats"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : errorMessage ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {STAT_CARDS.map((card) => (
            <div key={card.key} className="rounded-2xl border border-line bg-white p-5">
              <p className="font-display text-2xl font-semibold text-ink">{stats[card.key]}</p>
              <p className="mt-1 text-sm text-ink-soft">{card.label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </AdminLayout>
  );
}