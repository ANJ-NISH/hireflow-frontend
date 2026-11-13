import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getCandidateProfileByUserId, type CandidateProfile } from "../../lib/api/candidateProfile";

function formatDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function CandidateProfileViewPage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getCandidateProfileByUserId(userId)
      .then(({ profile }) => setProfile(profile))
      .catch((err) => setErrorMessage(err.message || "Profile not found"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-ink-soft">Loading…</div>
      </div>
    );
  }

  if (errorMessage || !profile) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-ink">Profile not available</p>
          <p className="mt-2 text-sm text-ink-soft">{errorMessage || "This candidate hasn't filled out a profile yet."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/recruiter/jobs" className="text-sm font-medium text-ink-soft hover:text-primary">
          ← Back
        </Link>

        <div className="mt-6 rounded-2xl border border-line bg-white p-8">
          {profile.headline && (
            <h1 className="font-display text-xl font-semibold text-ink md:text-2xl">{profile.headline}</h1>
          )}
          {(profile.location || profile.phone) && (
            <p className="mt-1 text-sm text-ink-soft">
              {[profile.location, profile.phone].filter(Boolean).join(" · ")}
            </p>
          )}
          {profile.bio && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{profile.bio}</p>}

          {profile.skills.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-sm font-semibold text-ink">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span key={s} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-soft">{s}</span>
                ))}
              </div>
            </div>
          )}

          {profile.languages.length > 0 && (
            <div className="mt-4">
              <h2 className="font-display text-sm font-semibold text-ink">Languages</h2>
              <p className="mt-1 text-sm text-ink-soft">{profile.languages.join(", ")}</p>
            </div>
          )}

          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep"
            >
              View resume →
            </a>
          )}

          {profile.experiences.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-display text-base font-semibold text-ink">Experience</h2>
              <div className="mt-4 flex flex-col gap-4">
                {profile.experiences.map((exp) => (
                  <div key={exp.id}>
                    <p className="text-sm font-semibold text-ink">{exp.title} · {exp.company}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {formatDate(exp.startDate)} – {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                    </p>
                    {exp.description && <p className="mt-1 text-sm text-ink-soft">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.educations.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-display text-base font-semibold text-ink">Education</h2>
              <div className="mt-4 flex flex-col gap-4">
                {profile.educations.map((edu) => (
                  <div key={edu.id}>
                    <p className="text-sm font-semibold text-ink">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{edu.institution} · {formatDate(edu.startDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.certifications.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-display text-base font-semibold text-ink">Certifications</h2>
              <div className="mt-4 flex flex-col gap-3">
                {profile.certifications.map((cert) => (
                  <div key={cert.id}>
                    <p className="text-sm font-semibold text-ink">{cert.name}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{cert.issuer} · {formatDate(cert.issueDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.projects.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-display text-base font-semibold text-ink">Projects</h2>
              <div className="mt-4 flex flex-col gap-4">
                {profile.projects.map((proj) => (
                  <div key={proj.id}>
                    <p className="text-sm font-semibold text-ink">{proj.title}</p>
                    {proj.description && <p className="mt-0.5 text-sm text-ink-soft">{proj.description}</p>}
                    {proj.techStack.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {proj.techStack.map((t) => (
                          <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-xs text-ink-soft">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}