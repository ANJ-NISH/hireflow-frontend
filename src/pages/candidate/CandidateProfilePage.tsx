import { useEffect, useState, type FormEvent } from "react";
import Navbar from "../../components/Navbar";
import {
  getMyProfile,
  updateMyProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addCertification,
  deleteCertification,
  addProject,
  deleteProject,
  type CandidateProfile,
} from "../../lib/api/candidateProfile";
import ResumeManager from "../../components/ResumeManager";
import { ApiError } from "../../lib/api/client";

function formatDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Small reusable "add entry" panel — toggled open/closed, calls onAdd, then closes on success
function AddPanel({
  label,
  onCancel,
  children,
}: {
  label: string;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 rounded-xl border border-line bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-ink">{label}</p>
      {children}
      <button
        type="button"
        onClick={onCancel}
        className="mt-3 text-xs font-semibold text-ink-soft hover:text-primary"
      >
        Cancel
      </button>
    </div>
  );
}

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Basic info form state
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [savingBasics, setSavingBasics] = useState(false);
  const [totalExperienceYears, setTotalExperienceYears] = useState("");

  // Which "add" panel is open, if any
  const [openPanel, setOpenPanel] = useState<"experience" | "education" | "certification" | "project" | null>(null);

  useEffect(() => {
    getMyProfile()
      .then(({ profile }) => {
        setProfile(profile);
        setHeadline(profile.headline || "");
        setBio(profile.bio || "");
        setLocation(profile.location || "");
        setPhone(profile.phone || "");
        setSkillsInput(profile.skills.join(", "));
        setLanguagesInput(profile.languages.join(", "));
        setTotalExperienceYears(profile.totalExperienceYears?.toString() || "");
      })
      .catch((err) => setErrorMessage(err.message || "Could not load profile"))
      .finally(() => setLoading(false));
  }, []);

  const refreshFromServer = (updates: Partial<CandidateProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const handleSaveBasics = async (e: FormEvent) => {
    e.preventDefault();
    setSavingBasics(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { profile: updated } = await updateMyProfile({
        headline,
        bio,
        location,
        phone,
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        languages: languagesInput.split(",").map((s) => s.trim()).filter(Boolean),
        totalExperienceYears: totalExperienceYears ? Number(totalExperienceYears) : undefined,
      });
      refreshFromServer(updated);
      setSuccessMessage("Profile saved.");
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setSavingBasics(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-ink-soft">Loading…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-red-600">{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Your profile
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Candidate profile
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          This is what recruiters see when you apply to a job.
        </p>

        {/* Basic info */}
        <form onSubmit={handleSaveBasics} className="mt-8 rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-base font-semibold text-ink">Basic info</h2>

          <div className="mt-4 flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Headline</span>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Backend Engineer specializing in distributed systems"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Bio</span>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short summary of your background…"
                className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Location</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bengaluru, India"
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Phone</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Years of experience</span>
              <input
                type="number"
                min={0}
                value={totalExperienceYears}
                onChange={(e) => setTotalExperienceYears(e.target.value)}
                placeholder="3"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Skills</span>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Node.js, PostgreSQL, System Design (comma separated)"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Languages</span>
              <input
                type="text"
                value={languagesInput}
                onChange={(e) => setLanguagesInput(e.target.value)}
                placeholder="English, Hindi (comma separated)"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={savingBasics}
            className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
          >
            {savingBasics ? "Saving…" : "Save"}
          </button>
        </form>

        <section className="mt-8 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-base font-semibold text-ink">Resumes</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Upload up to 5 resumes and pick which one to send with each application.
        </p>
        <div className="mt-4">
          <ResumeManager />
        </div>
      </section>

        {/* Experience */}
        <section className="mt-8 rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Experience</h2>
            <button
              onClick={() => setOpenPanel(openPanel === "experience" ? null : "experience")}
              className="text-sm font-semibold text-primary hover:text-primary-deep"
            >
              + Add
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {profile.experiences.length === 0 && (
              <p className="text-sm text-ink-soft">No experience added yet.</p>
            )}
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="flex items-start justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-ink">{exp.title} · {exp.company}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {formatDate(exp.startDate)} – {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  {exp.description && <p className="mt-1 text-sm text-ink-soft">{exp.description}</p>}
                </div>
                <button
                  onClick={async () => {
                    await deleteExperience(exp.id);
                    refreshFromServer({ experiences: profile.experiences.filter((e) => e.id !== exp.id) });
                  }}
                  className="shrink-0 text-xs font-semibold text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {openPanel === "experience" && (
            <ExperienceForm
              onCancel={() => setOpenPanel(null)}
              onAdded={(exp) => {
                refreshFromServer({ experiences: [exp, ...profile.experiences] });
                setOpenPanel(null);
              }}
            />
          )}
        </section>

        {/* Education */}
        <section className="mt-8 rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Education</h2>
            <button
              onClick={() => setOpenPanel(openPanel === "education" ? null : "education")}
              className="text-sm font-semibold text-primary hover:text-primary-deep"
            >
              + Add
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {profile.educations.length === 0 && (
              <p className="text-sm text-ink-soft">No education added yet.</p>
            )}
            {profile.educations.map((edu) => (
              <div key={edu.id} className="flex items-start justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-ink">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {edu.institution} · {formatDate(edu.startDate)} – {formatDate(edu.endDate) || "Present"}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await deleteEducation(edu.id);
                    refreshFromServer({ educations: profile.educations.filter((e) => e.id !== edu.id) });
                  }}
                  className="shrink-0 text-xs font-semibold text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {openPanel === "education" && (
            <EducationForm
              onCancel={() => setOpenPanel(null)}
              onAdded={(edu) => {
                refreshFromServer({ educations: [edu, ...profile.educations] });
                setOpenPanel(null);
              }}
            />
          )}
        </section>

        {/* Certifications */}
        <section className="mt-8 rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Certifications</h2>
            <button
              onClick={() => setOpenPanel(openPanel === "certification" ? null : "certification")}
              className="text-sm font-semibold text-primary hover:text-primary-deep"
            >
              + Add
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {profile.certifications.length === 0 && (
              <p className="text-sm text-ink-soft">No certifications added yet.</p>
            )}
            {profile.certifications.map((cert) => (
              <div key={cert.id} className="flex items-start justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-ink">{cert.name}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {cert.issuer} · Issued {formatDate(cert.issueDate)}
                  </p>
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline">
                      View credential →
                    </a>
                  )}
                </div>
                <button
                  onClick={async () => {
                    await deleteCertification(cert.id);
                    refreshFromServer({ certifications: profile.certifications.filter((c) => c.id !== cert.id) });
                  }}
                  className="shrink-0 text-xs font-semibold text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {openPanel === "certification" && (
            <CertificationForm
              onCancel={() => setOpenPanel(null)}
              onAdded={(cert) => {
                refreshFromServer({ certifications: [cert, ...profile.certifications] });
                setOpenPanel(null);
              }}
            />
          )}
        </section>

        {/* Projects */}
        <section className="mt-8 rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Projects</h2>
            <button
              onClick={() => setOpenPanel(openPanel === "project" ? null : "project")}
              className="text-sm font-semibold text-primary hover:text-primary-deep"
            >
              + Add
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {profile.projects.length === 0 && (
              <p className="text-sm text-ink-soft">No projects added yet.</p>
            )}
            {profile.projects.map((proj) => (
              <div key={proj.id} className="flex items-start justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-ink">{proj.title}</p>
                  {proj.description && <p className="mt-0.5 text-sm text-ink-soft">{proj.description}</p>}
                  {proj.techStack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {proj.techStack.map((t) => (
                        <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-xs text-ink-soft">{t}</span>
                      ))}
                    </div>
                  )}
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs font-semibold text-primary hover:underline">
                      View project →
                    </a>
                  )}
                </div>
                <button
                  onClick={async () => {
                    await deleteProject(proj.id);
                    refreshFromServer({ projects: profile.projects.filter((p) => p.id !== proj.id) });
                  }}
                  className="shrink-0 text-xs font-semibold text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {openPanel === "project" && (
            <ProjectForm
              onCancel={() => setOpenPanel(null)}
              onAdded={(proj) => {
                refreshFromServer({ projects: [proj, ...profile.projects] });
                setOpenPanel(null);
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
}

// --- Small inline sub-forms ---

function ExperienceForm({ onCancel, onAdded }: { onCancel: () => void; onAdded: (e: any) => void }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { experience } = await addExperience({
        title, company, location: location || undefined,
        startDate, endDate: isCurrent ? undefined : endDate || undefined,
        isCurrent, description: description || undefined,
      });
      onAdded(experience);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AddPanel label="Add experience" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <div className="grid grid-cols-2 gap-3">
          <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
          <input type="date" disabled={isCurrent} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50" />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} />
          I currently work here
        </label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <button type="submit" disabled={submitting} className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-60">
          {submitting ? "Adding…" : "Add"}
        </button>
      </form>
    </AddPanel>
  );
}

function EducationForm({ onCancel, onAdded }: { onCancel: () => void; onAdded: (e: any) => void }) {
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { education } = await addEducation({
        institution, degree, fieldOfStudy: fieldOfStudy || undefined,
        startDate, endDate: endDate || undefined,
      });
      onAdded(education);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AddPanel label="Add education" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input required value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Institution" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <input required value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="Degree" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <input value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} placeholder="Field of study (optional)" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <div className="grid grid-cols-2 gap-3">
          <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <button type="submit" disabled={submitting} className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-60">
          {submitting ? "Adding…" : "Add"}
        </button>
      </form>
    </AddPanel>
  );
}

function CertificationForm({ onCancel, onAdded }: { onCancel: () => void; onAdded: (e: any) => void }) {
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { certification } = await addCertification({ name, issuer, issueDate, url: url || undefined });
      onAdded(certification);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AddPanel label="Add certification" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Certification name" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <input required value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Issued by" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <input required type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Credential URL (optional)" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <button type="submit" disabled={submitting} className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-60">
          {submitting ? "Adding…" : "Add"}
        </button>
      </form>
    </AddPanel>
  );
}

function ProjectForm({ onCancel, onAdded }: { onCancel: () => void; onAdded: (e: any) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { project } = await addProject({
        title, description: description || undefined, url: url || undefined,
        techStack: techStackInput.split(",").map((s) => s.trim()).filter(Boolean),
      });
      onAdded(project);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AddPanel label="Add project" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <input value={techStackInput} onChange={(e) => setTechStackInput(e.target.value)} placeholder="Tech stack, comma separated" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Project URL (optional)" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
        <button type="submit" disabled={submitting} className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-60">
          {submitting ? "Adding…" : "Add"}
        </button>
      </form>
    </AddPanel>
  );
}