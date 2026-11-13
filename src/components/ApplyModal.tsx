import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { applyToJob } from "../lib/api/application";
import {
  listMyResumes,
  uploadResumeFile,
  formatFileSize,
  MAX_RESUMES,
  RESUME_ACCEPT,
  type Resume,
} from "../lib/api/resume";
import { ApiError } from "../lib/api/client";

export default function ApplyModal({
  jobId,
  jobTitle,
  onClose,
  onSuccess,
}: {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listMyResumes()
      .then(({ resumes }) => {
        setResumes(resumes);
        // Preselect the primary resume, falling back to the most recent one
        const preferred = resumes.find((r) => r.isPrimary) ?? resumes[0];
        if (preferred) setSelectedResumeId(preferred.id);
      })
      .catch(() => setErrorMessage("Could not load your resumes."))
      .finally(() => setLoadingResumes(false));
  }, []);

  const handleFileChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setErrorMessage(null);
    setUploading(true);
    setProgress(0);
    try {
      const resume = await uploadResumeFile(file, setProgress);
      setResumes((prev) => [resume, ...prev]);
      setSelectedResumeId(resume.id); // a resume you just uploaded is almost certainly the one you want
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await applyToJob(jobId, {
        resumeId: selectedResumeId || undefined,
        coverLetter: coverLetter || undefined,
      });
      onSuccess();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const atLimit = resumes.length >= MAX_RESUMES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold text-ink">Apply to {jobTitle}</h2>
        <p className="mt-1 text-sm text-ink-soft">Choose a resume and add a short note.</p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          <div>
            <span className="mb-2 block text-sm font-medium text-ink">Resume</span>

            {loadingResumes ? (
              <p className="text-sm text-ink-soft">Loading your resumes…</p>
            ) : (
              <div className="flex flex-col gap-2">
                {resumes.map((resume) => (
                  <label
                    key={resume.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                      selectedResumeId === resume.id ? "border-primary bg-primary-soft" : "border-line hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="resume"
                      checked={selectedResumeId === resume.id}
                      onChange={() => setSelectedResumeId(resume.id)}
                      className="accent-primary"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {resume.originalFilename}
                        {resume.isPrimary && <span className="ml-2 text-xs font-semibold text-primary">Primary</span>}
                      </p>
                      <p className="text-xs text-ink-soft">{formatFileSize(resume.sizeBytes)}</p>
                    </div>
                  </label>
                ))}

                {resumes.length > 0 && (
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                      selectedResumeId === null ? "border-primary bg-primary-soft" : "border-line hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="resume"
                      checked={selectedResumeId === null}
                      onChange={() => setSelectedResumeId(null)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-ink-soft">Apply without a resume</span>
                  </label>
                )}

                {resumes.length === 0 && (
                  <p className="text-sm text-ink-soft">You haven't uploaded a resume yet.</p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={RESUME_ACCEPT}
                  onChange={handleFileChosen}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || atLimit}
                  className="self-start text-sm font-semibold text-primary hover:text-primary-deep disabled:opacity-50"
                >
                  {uploading
                    ? `Uploading… ${progress}%`
                    : atLimit
                    ? `Resume limit reached (${MAX_RESUMES})`
                    : "+ Upload a new resume"}
                </button>
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Cover letter</span>
            <textarea
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Why you're a good fit for this role…"
              className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}