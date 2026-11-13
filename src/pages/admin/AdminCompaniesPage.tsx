import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listCompanies, approveCompany, rejectCompany, type AdminCompany } from "../../lib/api/admin";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [filter, setFilter] = useState<"" | "true" | "false">("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listCompanies({ isApproved: filter === "" ? undefined : filter === "true" })
      .then(({ companies }) => setCompanies(companies))
      .catch((err) => setErrorMessage(err.message || "Could not load companies"))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleDecision = async (id: string, approve: boolean) => {
    setBusyId(id);
    setErrorMessage(null);
    try {
      const { company } = approve ? await approveCompany(id) : await rejectCompany(id);
      setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, isApproved: company.isApproved } : c)));
    } catch (err: any) {
      setErrorMessage(err.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as any)}
        className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        <option value="">All companies</option>
        <option value="true">Approved</option>
        <option value="false">Pending / rejected</option>
      </select>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : companies.length === 0 ? (
          <p className="text-sm text-ink-soft">No companies found.</p>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-line bg-white p-5">
              <div>
                <p className="font-display text-base font-semibold text-ink">{company.name}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {company.recruiter.name} · {company.recruiter.email}
                </p>
                <p className="mt-1 text-xs text-ink-soft">{company._count.jobs} job(s) posted</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${company.isApproved ? "bg-emerald-50 text-success" : "bg-amber-50 text-accent"}`}>
                  {company.isApproved ? "Approved" : "Pending"}
                </span>
                {!company.isApproved && (
                  <button
                    disabled={busyId === company.id}
                    onClick={() => handleDecision(company.id, true)}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-deep disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                {company.isApproved && (
                  <button
                    disabled={busyId === company.id}
                    onClick={() => handleDecision(company.id, false)}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-red-500 hover:border-red-300 disabled:opacity-50"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}