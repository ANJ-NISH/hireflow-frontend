import type { PublicJob, WorkMode } from "./api/job";
import type { Job as JobCardJob } from "../components/JobCard";

export function formatSalary(min?: number | null, max?: number | null): string {
  const toLakhs = (n: number) => `₹${Math.round(n / 100000)}L`;

  if (min && max) return `${toLakhs(min)} – ${toLakhs(max)}`;
  if (min) return `${toLakhs(min)}+`;
  if (max) return `Up to ${toLakhs(max)}`;
  return "Salary not disclosed";
}

export function formatWorkMode(mode: WorkMode): JobCardJob["workMode"] {
  if (mode === "REMOTE") return "Remote";
  if (mode === "HYBRID") return "Hybrid";
  return "On-site";
}

export function formatPostedAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function toJobCardJob(job: PublicJob): JobCardJob {
  return {
    id: job.id,
    title: job.title,
    company: job.company.name,
    location: job.location,
    workMode: formatWorkMode(job.workMode),
    employmentType: job.employmentType,
    salary: formatSalary(job.salaryMin, job.salaryMax),
    skills: job.skills.slice(0, 3),
    postedAgo: formatPostedAgo(job.createdAt),
  };
}