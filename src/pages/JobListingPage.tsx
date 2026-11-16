import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import JobCard from "../components/JobCard";
import { searchJobs, type WorkMode, type Pagination } from "../lib/api/job";
import { toJobCardJob } from "../lib/jobFormat";
import type { Job as JobCardJob } from "../components/JobCard";
import RecentlyViewedStrip from "../components/RecentlyViewedStrip";

const WORK_MODE_OPTIONS: { label: string; value: WorkMode | "" }[] = [
  { label: "Any work mode", value: "" },
  { label: "Remote", value: "REMOTE" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "On-site", value: "ONSITE" },
];

export default function JobListingPage() {
  const [searchParams] = useSearchParams();


  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [workMode, setWorkMode] = useState<WorkMode | "">(
    (searchParams.get("workMode") as WorkMode) || ""
  );
  const [employmentType, setEmploymentType] = useState(searchParams.get("employmentType") || "");
  const [skill, setSkill] = useState(searchParams.get("skill") || "");
  const [page, setPage] = useState(1);

  const [jobs, setJobs] = useState<JobCardJob[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setErrorMessage(null);

      searchJobs({
        search: search || undefined,
        location: location || undefined,
        workMode: workMode || undefined,
        employmentType: employmentType || undefined,
        skill: skill || undefined,
        page,
        limit: 9,
      })
        .then(({ jobs, pagination }) => {
          setJobs(jobs.map(toJobCardJob));
          setPagination(pagination);
        })
        .catch((err) => setErrorMessage(err.message || "Could not load jobs"))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [search, location, workMode, employmentType, skill, page]);

  const updateFilter = (setter: (v: any) => void) => (value: any) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setWorkMode("");
    setEmploymentType("");
    setSkill("");
    setPage(1);
  };

  const hasActiveFilters = search || location || workMode || employmentType || skill;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Browse openings
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Find your next role
        </h1>

        <div className="mt-8 rounded-2xl border border-line bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block lg:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">Title or skill</span>
              <input
                type="text"
                value={search}
                onChange={(e) => updateFilter(setSearch)(e.target.value)}
                placeholder="e.g. Backend Engineer"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">Location</span>
              <input
                type="text"
                value={location}
                onChange={(e) => updateFilter(setLocation)(e.target.value)}
                placeholder="e.g. Bengaluru"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">Work mode</span>
              <select
                value={workMode}
                onChange={(e) => updateFilter(setWorkMode)(e.target.value as WorkMode | "")}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {WORK_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">Employment type</span>
              <input
                type="text"
                value={employmentType}
                onChange={(e) => updateFilter(setEmploymentType)(e.target.value)}
                placeholder="e.g. Full-time"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-line px-3.5 py-2">
              <span className="text-xs font-medium text-ink-soft">Skill</span>
              <input
                type="text"
                value={skill}
                onChange={(e) => updateFilter(setSkill)(e.target.value)}
                placeholder="e.g. PostgreSQL"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/50"
              />
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft hover:border-primary hover:text-primary"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <RecentlyViewedStrip />

        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-ink-soft">Loading jobs…</p>
          ) : errorMessage ? (
            <p className="text-sm text-ink-soft">Could not load jobs right now — check back soon.</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-ink-soft">No jobs match your filters. Try widening your search.</p>
          ) : (
            <>
              <p className="text-sm text-ink-soft">
                {pagination?.total ?? 0} job{pagination?.total === 1 ? "" : "s"} found
              </p>

              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-3 text-sm text-ink-soft">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
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