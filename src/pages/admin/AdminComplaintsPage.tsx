import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listComplaints, resolveComplaint, type Complaint } from "../../lib/api/admin";

const STATUS_STYLES: Record<Complaint["status"], string> = {
  OPEN: "bg-amber-50 text-accent",
  RESOLVED: "bg-emerald-50 text-success",
  DISMISSED: "bg-surface text-ink-soft",
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [status, setStatus] = useState("OPEN");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listComplaints({ status: status || undefined })
      .then(({ complaints }) => setComplaints(complaints))
      .catch((err) => setErrorMessage(err.message || "Could not load complaints"))
      .finally(() => setLoading(false));
  }, [status]);

  const handleResolve = async (id: string, decision: "RESOLVED" | "DISMISSED") => {
    setBusyId(id);
    setErrorMessage(null);
    try {
      await resolveComplaint(id, decision, noteDrafts[id]);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || "Action failed");
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
        <option value="OPEN">Open</option>
        <option value="RESOLVED">Resolved</option>
        <option value="DISMISSED">Dismissed</option>
        <option value="">All</option>
      </select>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : complaints.length === 0 ? (
          <p className="text-sm text-ink-soft">No complaints here.</p>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {c.targetType} · <span className="font-mono text-xs text-ink-soft">{c.targetId}</span>
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Reported by {c.reporter.name} ({c.reporter.email})
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[c.status]}`}>
                  {c.status}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-line rounded-xl bg-surface p-3 text-sm text-ink-soft">{c.reason}</p>

              {c.status === "OPEN" && (
                <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
                  <input
                    type="text"
                    value={noteDrafts[c.id] || ""}
                    onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="Admin note (optional)"
                    className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === c.id}
                      onClick={() => handleResolve(c.id, "RESOLVED")}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-deep disabled:opacity-50"
                    >
                      Mark resolved
                    </button>
                    <button
                      disabled={busyId === c.id}
                      onClick={() => handleResolve(c.id, "DISMISSED")}
                      className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}