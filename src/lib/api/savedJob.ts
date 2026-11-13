import { apiRequest } from "./client";
import type { PublicJob } from "./job";

export type SavedJob = {
  id: string;
  jobId: string;
  candidateId: string;
  createdAt: string;
  job: PublicJob;
};

export function saveJob(jobId: string) {
  return apiRequest<{ savedJob: SavedJob }>(`/api/saved-jobs/${jobId}`, { method: "POST" });
}

export function unsaveJob(jobId: string) {
  return apiRequest<null>(`/api/saved-jobs/${jobId}`, { method: "DELETE" });
}

export function listSavedJobs() {
  return apiRequest<{ savedJobs: SavedJob[] }>("/api/saved-jobs");
}

export function checkIfSaved(jobId: string) {
  return apiRequest<{ isSaved: boolean }>(`/api/saved-jobs/${jobId}/check`);
}