import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createCompany, getMyCompany, updateMyCompany, type Company } from "../../lib/api/company";
import { ApiError } from "../../lib/api/client";
import Navbar from "../../components/Navbar";

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = (location.state as { next?: string } | null)?.next;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    getMyCompany()
      .then(({ company }) => {
        setCompany(company);
        setName(company.name);
        setDescription(company.description || "");
        setWebsite(company.website || "");
        setLogoUrl(company.logoUrl || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = { name, description, website, logoUrl };
    const isCreating = !company;

    try {
      const result = company ? await updateMyCompany(payload) : await createCompany(payload);
      setCompany(result.company);

      if (isCreating && nextPath) {
        navigate(nextPath);
        return;
      }

      setSuccessMessage(company ? "Company profile updated." : "Company profile created.");
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = err.errors ? Object.values(err.errors).flat()[0] : null;
        setErrorMessage((firstError as string) || err.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-ink-soft">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {company ? "Manage company" : "Get started"}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {company ? "Company profile" : "Create your company profile"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {nextPath
            ? "Just this once — you'll come right back to posting your job after this."
            : "This is what candidates see on every job you post."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Company name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nimbus Systems"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Description</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your company do?"
              className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Website</span>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Logo URL</span>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-deep disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {saving ? "Saving…" : company ? "Save changes" : "Create company"}
          </button>
        </form>
      </div>
    </div>
  );
}