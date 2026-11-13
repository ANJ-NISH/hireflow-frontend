import { apiRequest } from "./client";

export type WorkMode = "REMOTE" | "HYBRID" | "ONSITE";
export type JobStatus = "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED";

export type Job = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  workMode: WorkMode;
  employmentType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  experienceMin?: number | null;
  experienceMax?: number | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

export type JobInput = {
  title: string;
  description: string;
  skills: string[];
  location: string;
  workMode: WorkMode;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceMin?: number;
  experienceMax?: number;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type PublicJob = Job & {
  company: { name: string; logoUrl?: string | null };
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type JobSearchParams = {
  search?: string;
  location?: string;
  workMode?: WorkMode;
  employmentType?: string;
  skill?: string;
  page?: number;
  limit?: number;
};

export async function searchJobs(
  params: JobSearchParams = {}
): Promise<{ jobs: PublicJob[]; pagination: Pagination }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });

  const res = await fetch(`${API_URL}/api/jobs?${query.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load jobs");
  }

  return data.data;
}

export async function getJobById(id: string): Promise<{ job: PublicJob }> {
  const res = await fetch(`${API_URL}/api/jobs/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Job not found");
  }

  return data.data;
}

export function createJob(input: JobInput) {
  return apiRequest<{ job: Job }>("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateJob(id: string, input: Partial<JobInput>) {
  return apiRequest<{ job: Job }>(`/api/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function publishJob(id: string) {
  return apiRequest<{ job: Job }>(`/api/jobs/${id}/publish`, { method: "POST" });
}

export function pauseJob(id: string) {
  return apiRequest<{ job: Job }>(`/api/jobs/${id}/pause`, { method: "POST" });
}

export function closeJob(id: string) {
  return apiRequest<{ job: Job }>(`/api/jobs/${id}/close`, { method: "POST" });
}

export function deleteJob(id: string) {
  return apiRequest<null>(`/api/jobs/${id}`, { method: "DELETE" });
}

export function listMyJobs() {
  return apiRequest<{ jobs: Job[] }>("/api/jobs/mine");
}