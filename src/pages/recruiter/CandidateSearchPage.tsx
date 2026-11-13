import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { searchCandidates, type CandidateSearchResult } from "../../lib/api/recruiterTools";
import type { Pagination } from "../../lib/api/job";

export default function CandidateSearchPage() {
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [experienceMin, setExperienceMin] = useState("");
  const [experienceMax, setExperienceMax] = useState("");
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<CandidateSearchResult[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      searchCandidates({
        skill: skill || undefined,
        location: location || undefined,
        experienceMin: experienceMin ? Number(experienceMin) : undefined,
        experienceMax: experienceMax ? Number(experienceMax) : undefined,
        page,
        limit: 12,
      })
        .then(({ profiles, pagination }) => {
          setResults(profiles);
          setPagination(pagination);
        })
        .catch((err) => setErrorMessage(err.message || "Could not search candidates"))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [skill, location, experienceMin, experienceMax, page]);

  const resetPage = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Talent search
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Search candidates
        </h1>

        <div className="mt-6 rounded-2xl border border-line bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={skill}
              onChange={(e) => resetPage(setSkill)(e.target.value)}
              placeholder="Skill, e.g. PostgreSQL"
              className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => resetPage(setLocation)(e.target.value)}
              placeholder="Location"
              className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <input
              type="number"
              value={experienceMin}
              onChange={(e) => resetPage(setExperienceMin)(e.target.value)}
              placeholder="Min years exp."
              className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <input
              type="number"
              value={experienceMax}
              onChange={(e) => resetPage(setExperienceMax)(e.target.value)}
              placeholder="Max years exp."
              className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
        )}

        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-ink-soft">Searching…</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-ink-soft">No candidates match these filters.</p>
          ) : (
            <>
              <p className="text-sm text-ink-soft">{pagination?.total ?? 0} candidate(s) found</p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.map((c) => (
                  <Link
                    key={c.id}
                    to={`/recruiter/candidates/${c.userId}`}
                    className="rounded-2xl border border-line bg-white p-5 transition-colors hover:border-primary/30"
                  >
                    <p className="font-display text-base font-semibold text-ink">{c.user.name}</p>
                    {c.headline && <p className="mt-0.5 text-sm text-ink-soft">{c.headline}</p>}
                    <p className="mt-1 text-xs text-ink-soft">
                      {[c.location, c.totalExperienceYears != null ? `${c.totalExperienceYears} yrs exp.` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {c.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.skills.slice(0, 5).map((s) => (
                          <span key={s} className="rounded-full bg-surface px-2 py-0.5 text-xs text-ink-soft">{s}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-primary hover:text-primary disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-3 text-sm text-ink-soft">Page {pagination.page} of {pagination.totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-primary hover:text-primary disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}