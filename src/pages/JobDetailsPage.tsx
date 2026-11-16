import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ApplyModal from "../components/ApplyModal";
import { getJobById, type PublicJob } from "../lib/api/job";
import { formatSalary, formatWorkMode, formatPostedAgo } from "../lib/jobFormat";
import { isLoggedIn, getUser } from "../lib/auth";
import { recordJobView } from "../lib/api/recentlyViewed";

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<PublicJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!id) return;

    getJobById(id)
      .then(({ job }) => setJob(job))
      .catch((err) => setErrorMessage(err.message || "Job not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const user = getUser();
  const isCandidate = isLoggedIn() && user?.role === "CANDIDATE";

  const jobId = job?.id;
  useEffect(() => {
    if (!jobId || !isCandidate) return;
    recordJobView(jobId).catch(() => {});
  }, [jobId, isCandidate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-ink-soft">Loading…</div>
      </div>
    );
  }

  if (errorMessage || !job) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="font-display text-xl font-semibold text-ink">Job not found</p>
          <p className="mt-2 text-sm text-ink-soft">
            This listing may have been closed or removed.
          </p>
          <Link
            to="/jobs"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-deep"
          >
            Browse other jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/jobs" className="text-sm font-medium text-ink-soft hover:text-primary">
          ← Back to jobs
        </Link>

        <div className="mt-6 rounded-2xl border border-line bg-white p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft font-display text-lg font-semibold text-primary">
              {job.company.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                {job.title}
              </h1>
              <p className="mt-1 text-base text-ink-soft">{job.company.name}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-4 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {job.location}
            </span>
            <span>{formatWorkMode(job.workMode)}</span>
            <span>{job.employmentType}</span>
            <span className="font-mono font-semibold text-ink">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
            <span>{formatPostedAgo(job.createdAt)}</span>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-base font-semibold text-ink">About this role</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {job.description}
            </p>
          </div>

          {job.skills.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-base font-semibold text-ink">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(job.experienceMin || job.experienceMax) && (
            <div className="mt-6">
              <h2 className="font-display text-base font-semibold text-ink">Experience</h2>
              <p className="mt-2 text-sm text-ink-soft">
                {job.experienceMin && job.experienceMax
                  ? `${job.experienceMin}–${job.experienceMax} years`
                  : job.experienceMin
                  ? `${job.experienceMin}+ years`
                  : `Up to ${job.experienceMax} years`}
              </p>
            </div>
          )}

          <div className="mt-8 border-t border-line pt-6">
            {applied ? (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-success">
                Application submitted — track it from your{" "}
                <Link to="/candidate/applications" className="underline">
                  applications page
                </Link>
                .
              </p>
            ) : isCandidate ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-deep sm:w-auto"
              >
                Apply now
              </button>
            ) : isLoggedIn() ? (
              <p className="text-sm text-ink-soft">
                Recruiter accounts can't apply to jobs.
              </p>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Link
                  to="/login"
                  className="rounded-xl bg-primary px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-primary-deep"
                >
                  Log in to apply
                </Link>
                <span className="text-sm text-ink-soft">
                  or{" "}
                  <Link to="/register" className="font-semibold text-primary hover:text-primary-deep">
                    create an account
                  </Link>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showApplyModal && job && (
        <ApplyModal
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            setApplied(true);
          }}
        />
      )}
    </div>
  );
}