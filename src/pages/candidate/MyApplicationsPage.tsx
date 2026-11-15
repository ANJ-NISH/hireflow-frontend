import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  listMyApplications,
  withdrawApplication,
  type MyApplication,
  type MyInterview,
  type ApplicationStatus,
} from "../../lib/api/application";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  APPLIED: "bg-surface text-ink-soft",
  SCREENING: "bg-primary-soft text-primary",
  SHORTLISTED: "bg-primary-soft text-primary",
  INTERVIEW: "bg-amber-50 text-accent",
  OFFERED: "bg-emerald-50 text-success",
  HIRED: "bg-emerald-50 text-success",
  REJECTED: "bg-red-50 text-red-500",
  WITHDRAWN: "bg-surface text-ink-soft/60",
};

const PIPELINE_ORDER: ApplicationStatus[] = ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"];

const MODE_LABELS: Record<MyInterview["mode"], string> = { ONLINE: "Online", ONSITE: "On-site", PHONE: "Phone" };

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function isWebUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function InterviewList({ interviews }: { interviews: MyInterview[] }) {
  if (interviews.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">Interviews</p>
      <div className="mt-2 flex flex-col gap-3">
        {interviews.map((iv) => (
          <div key={iv.id} className={iv.status === "SCHEDULED" ? "" : "opacity-60"}>
            <p className={`text-sm font-medium text-ink ${iv.status === "CANCELLED" ? "line-through" : ""}`}>
              {formatWhen(iv.scheduledAt)}
            </p>
            <p className="text-xs text-ink-soft">
              {MODE_LABELS[iv.mode]}
              {iv.status === "COMPLETED" ? " · Completed" : iv.status === "CANCELLED" ? " · Cancelled" : ""}
            </p>
            {iv.locationOrUrl &&
              (isWebUrl(iv.locationOrUrl) ? (
                <a
                  href={iv.locationOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-block text-xs font-semibold text-primary hover:text-primary-deep"
                >
                  Open meeting link →
                </a>
              ) : (
                <p className="mt-0.5 text-xs text-ink-soft">{iv.locationOrUrl}</p>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    listMyApplications()
      .then(({ applications }) => setApplications(applications))
      .catch((err) => setErrorMessage(err.message || "Could not load applications"))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id: string) => {
    if (!confirm("Withdraw this application? You can reapply later if you change your mind.")) return;
    setBusyId(id);
    try {
      const { application } = await withdrawApplication(id);
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: application.status } : a)));
    } catch (err: any) {
      setErrorMessage(err.message || "Could not withdraw application");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Your pipeline</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          My applications
        </h1>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-ink-soft">Loading…</p>
        ) : applications.length === 0 ? (
          <div className="mt-10 text-sm text-ink-soft">
            You haven't applied to anything yet.{" "}
            <Link to="/jobs" className="font-semibold text-primary hover:text-primary-deep">
              Browse jobs →
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {applications.map((app) => {
              const isBusy = busyId === app.id;
              const canWithdraw = !["HIRED", "REJECTED", "WITHDRAWN"].includes(app.status);
              const stageIndex = PIPELINE_ORDER.indexOf(app.status);
              const showInterviews = app.status !== "WITHDRAWN" && app.status !== "REJECTED";

              return (
                <div key={app.id} className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/jobs/${app.job.id}`}
                        className="font-display text-base font-semibold text-ink hover:text-primary"
                      >
                        {app.job.title}
                      </Link>
                      <p className="mt-1 text-sm text-ink-soft">
                        {app.job.company.name} · {app.job.location}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[app.status]}`}>
                      {app.status}
                    </span>
                  </div>

                  {stageIndex !== -1 && (
                    <div className="mt-4 flex items-center gap-1">
                      {PIPELINE_ORDER.map((stage, i) => (
                        <div
                          key={stage}
                          className={`h-1.5 flex-1 rounded-full ${i <= stageIndex ? "bg-primary" : "bg-line"}`}
                        />
                      ))}
                    </div>
                  )}

                  {showInterviews && <InterviewList interviews={app.interviews ?? []} />}

                  {canWithdraw && (
                    <div className="mt-4 border-t border-line pt-4">
                      <button
                        disabled={isBusy}
                        onClick={() => handleWithdraw(app.id)}
                        className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-300 disabled:opacity-60"
                      >
                        {isBusy ? "Withdrawing…" : "Withdraw application"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}