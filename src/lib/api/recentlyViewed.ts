import { apiRequest } from "./client";
import type { PublicJob } from "./job";

export type RecentlyViewedJob = {
  id: string;
  jobId: string;
  candidateId: string;
  viewedAt: string;
  job: PublicJob;
};

export function recordJobView(jobId: string) {
  return apiRequest<null>(`/api/recently-viewed/${jobId}`, { method: "POST" });
}

export function listRecentlyViewed(limit = 12) {
  return apiRequest<{ recentlyViewed: RecentlyViewedJob[] }>(`/api/recently-viewed?limit=${limit}`);
}

export function removeRecentlyViewed(jobId: string) {
  return apiRequest<null>(`/api/recently-viewed/${jobId}`, { method: "DELETE" });
}

export function clearRecentlyViewed() {
  return apiRequest<null>("/api/recently-viewed", { method: "DELETE" });
}