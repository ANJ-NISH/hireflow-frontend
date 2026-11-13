import { useState } from "react";
import { getApplicantResumeDownloadUrl, openInNewTab } from "../lib/api/resume";

export default function ApplicantResumeLink({
  applicationId,
  resumeId,
  legacyUrl,
}: {
  applicationId: string;
  resumeId?: string | null;
  legacyUrl?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (resumeId) {
    const handleClick = async () => {
      setLoading(true);
      setError(null);
      try {
        await openInNewTab(async () => (await getApplicantResumeDownloadUrl(applicationId)).downloadUrl);
      } catch (err: any) {
        setError(err.message || "Could not open resume");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="mt-1">
        <button
          onClick={handleClick}
          disabled={loading}
          className="text-sm font-semibold text-primary hover:text-primary-deep disabled:opacity-60"
        >
          {loading ? "Opening…" : "View resume →"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (legacyUrl) {
    return (
      <a
        href={legacyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-sm font-semibold text-primary hover:text-primary-deep"
      >
        View resume →
      </a>
    );
  }

  return <p className="mt-1 text-xs text-ink-soft">No resume attached</p>;
}