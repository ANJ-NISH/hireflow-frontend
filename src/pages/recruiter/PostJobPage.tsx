import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createJob, type WorkMode } from "../../lib/api/job";
import { getMyCompany } from "../../lib/api/company";
import { ApiError } from "../../lib/api/client";
import Navbar from "../../components/Navbar";

export default function PostJobPage() {
  const navigate = useNavigate();

  // null = checking, false = no company yet, true = has one
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("REMOTE");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for a company profile before letting the recruiter fill out the form at all
  useEffect(() => {
    getMyCompany()
      .then(() => setHasCompany(true))
      .catch(() => setHasCompany(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const { job } = await createJob({
        title,
        description,
        skills,
        location,
        workMode,
        employmentType,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
      });

      navigate("/recruiter/jobs", { state: { justCreated: job.id } });
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = err.errors ? Object.values(err.errors).flat()[0] : null;
        setErrorMessage((firstError as string) || err.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Still checking — avoid flashing the form before we know
  if (hasCompany === null) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-ink-soft">Loading…</div>
      </div>
    );
  }

  // No company yet — block the form entirely and guide them to create one first
  if (hasCompany === false) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-2xl border border-line bg-surface p-8 text-center">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
              One more step
            </p>
            <h1 className="mt-3 font-display text-xl font-semibold text-ink md:text-2xl">
              Create your company profile first
            </h1>
            <p className="mt-3 text-sm text-ink-soft">
              Candidates see your company on every job you post, so we need that set up before you can create a listing.
            </p>
            <Link
              to="/recruiter/company"
              state={{ next: "/recruiter/jobs/new" }}
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-deep"
            >
              Create company profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Has a company — render the actual form
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          New listing
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Post a job
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Saved as a draft first — you'll publish it from your job list.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Job title</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Backend Engineer"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Description</span>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities, requirements, team info…"
              className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Skills</span>
            <input
              type="text"
              required
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Node.js, PostgreSQL, Redis (comma separated)"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Location</span>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bengaluru"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Work mode</span>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Employment type</span>
            <input
              type="text"
              required
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              placeholder="Full-time"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Salary min</span>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="1500000"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Salary max</span>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="2600000"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-deep disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting ? "Creating…" : "Save as draft"}
          </button>
        </form>
      </div>
    </div>
  );
}