import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ApplicationToolsPanel from "../../components/ApplicationToolsPanel";
import ApplicantResumeLink from "../../components/ApplicantResumeLink";
import { listApplicantsForJob, updateApplicationStatus, type Applicant, type ApplicationStatus } from "../../lib/api/application";

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

const NEXT_STATUS_OPTIONS: ApplicationStatus[] = ["SCREENING", "SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"];

export default function JobApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    listApplicantsForJob(jobId)
      .then(({ applications }) => setApplicants(applications))
      .catch((err) => setErrorMessage(err.message || "Could not load applicants"))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    setBusyId(id);
    setErrorMessage(null);
    try {
      const { application } = await updateApplicationStatus(id, status);
      setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, status: application.status } : a)));
    } catch (err: any) {
      setErrorMessage(err.message || "Could not update status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link to="/recruiter/jobs" className="text-sm font-medium text-ink-soft hover:text-primary">
          ← Back to my jobs
        </Link>

        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Applicants
        </h1>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-ink-soft">Loading…</p>
        ) : applicants.length === 0 ? (
          <p className="mt-10 text-sm text-ink-soft">No one has applied yet.</p>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {applicants.map((app) => {
              const isBusy = busyId === app.id;
              const isFinal = ["HIRED", "REJECTED", "WITHDRAWN"].includes(app.status);
              const isExpanded = expandedId === app.id;

              return (
                <div key={app.id} className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-base font-semibold text-ink">{app.candidate.name}</h3>
                      <p className="mt-1 text-sm text-ink-soft">{app.candidate.email}</p>
                      <ApplicantResumeLink
                      applicationId={app.id}
                      resumeId={app.resumeId}
                      legacyUrl={app.resumeUrl}
                    />
                      <Link
                        to={`/recruiter/candidates/${app.candidate.id}`}
                        className="mt-1 block text-sm font-semibold text-primary hover:text-primary-deep"
                      >
                        View full profile →
                      </Link>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[app.status]}`}>
                      {app.status}
                    </span>
                  </div>

                  {app.coverLetter && (
                    <p className="mt-4 whitespace-pre-line rounded-xl bg-surface p-4 text-sm text-ink-soft">
                      {app.coverLetter}
                    </p>
                  )}

                  {!isFinal && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                      {NEXT_STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          disabled={isBusy || app.status === status}
                          onClick={() => handleStatusChange(app.id, status)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${
                            status === "REJECTED"
                              ? "border border-line text-red-500 hover:border-red-300"
                              : "border border-line text-ink-soft hover:border-primary hover:text-primary"
                          }`}
                        >
                          Move to {status}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 border-t border-line pt-4">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      className="text-xs font-semibold text-primary hover:text-primary-deep"
                    >
                      {isExpanded ? "Hide notes & interviews ▲" : "Notes & interviews ▼"}
                    </button>

                    {isExpanded && (
                      <div className="mt-4">
                        <ApplicationToolsPanel applicationId={app.id} />
                      </div>
                    )}
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