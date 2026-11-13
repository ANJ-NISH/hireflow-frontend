import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  listMyResumes,
  uploadResumeFile,
  setPrimaryResume,
  deleteResume,
  getMyResumeDownloadUrl,
  openInNewTab,
  formatFileSize,
  MAX_RESUMES,
  RESUME_ACCEPT,
  type Resume,
} from "../lib/api/resume";

export default function ResumeManager() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listMyResumes()
      .then(({ resumes }) => setResumes(resumes))
      .catch((err) => setErrorMessage(err.message || "Could not load resumes"))
      .finally(() => setLoading(false));
  }, []);

  const atLimit = resumes.length >= MAX_RESUMES;

  const handleFileChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the user pick the same file again later
    if (!file) return;

    setErrorMessage(null);
    setUploading(true);
    setProgress(0);
    try {
      const resume = await uploadResumeFile(file, setProgress);
      setResumes((prev) => [resume, ...prev]);
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    setBusyId(id);
    setErrorMessage(null);
    try {
      await setPrimaryResume(id);
      setResumes((prev) => prev.map((r) => ({ ...r, isPrimary: r.id === id })));
    } catch (err: any) {
      setErrorMessage(err.message || "Could not update primary resume");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume? Applications that already used it will lose access to it.")) return;
    setBusyId(id);
    setErrorMessage(null);
    try {
      await deleteResume(id);
      // Refetch rather than patching locally: the server may have promoted another resume to primary
      const { resumes } = await listMyResumes();
      setResumes(resumes);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not delete resume");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (id: string) => {
    setErrorMessage(null);
    try {
      await openInNewTab(async () => (await getMyResumeDownloadUrl(id)).downloadUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not open resume");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
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
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-50"
        >
          {uploading ? `Uploading… ${progress}%` : "Upload resume"}
        </button>
        <p className="text-xs text-ink-soft">
          PDF or Word, up to 5MB · {resumes.length}/{MAX_RESUMES} used
        </p>
      </div>

      {uploading && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {errorMessage && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : resumes.length === 0 ? (
          <p className="text-sm text-ink-soft">No resumes uploaded yet.</p>
        ) : (
          resumes.map((resume) => (
            <div
              key={resume.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {resume.originalFilename}
                  {resume.isPrimary && (
                    <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                      Primary
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {formatFileSize(resume.sizeBytes)} · Uploaded{" "}
                  {new Date(resume.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-xs font-semibold">
                <button onClick={() => handleDownload(resume.id)} className="text-primary hover:underline">
                  View
                </button>
                {!resume.isPrimary && (
                  <button
                    disabled={busyId === resume.id}
                    onClick={() => handleSetPrimary(resume.id)}
                    className="text-ink-soft hover:text-primary disabled:opacity-50"
                  >
                    Make primary
                  </button>
                )}
                <button
                  disabled={busyId === resume.id}
                  onClick={() => handleDelete(resume.id)}
                  className="text-red-500 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}