import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const popularTags = [
  { label: "Remote", filter: { workMode: "REMOTE" } },
  { label: "Full-time", filter: { employmentType: "Full-time" } },
  { label: "Engineering", filter: { search: "Engineering" } },
  { label: "Bengaluru", filter: { location: "Bengaluru" } },
];

export default function Hero() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const goToJobs = (params: Partial<Record<string, string>>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    navigate(`/jobs${query.toString() ? `?${query.toString()}` : ""}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    goToJobs({ search: searchTerm, location });
  };

  const handleTagClick = (filter: Partial<Record<string, string>>) => {
    goToJobs(filter);
  };

  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full bg-primary-soft blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Built for candidates who hate the black hole
        </p>

        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
          Find the offer,
          <br />
          not just the job.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
          Search real openings, apply in a few clicks, and track every
          application from applied to hired — no more wondering if anyone
          read your resume.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-line bg-white p-3 shadow-lg shadow-ink/5 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-2 px-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-soft">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Job title or skill"
              className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60"
            />
          </div>

          <div className="hidden h-6 w-px bg-line sm:block" />

          <div className="flex flex-1 items-center gap-2 px-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-soft">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-deep"
          >
            Search jobs
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-ink-soft">Popular:</span>
          {popularTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleTagClick(tag.filter)}
              className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-primary hover:text-primary"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}