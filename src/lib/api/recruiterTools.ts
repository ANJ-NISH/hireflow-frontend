import { apiRequest } from "./client";
import type { Pagination } from "./job";

export type CandidateSearchResult = {
  id: string;
  userId: string;
  headline?: string | null;
  location?: string | null;
  skills: string[];
  languages: string[];
  totalExperienceYears?: number | null;
  user: { id: string; name: string;};
};

export type ApplicationNote = {
  id: string;
  applicationId: string;
  recruiterId: string;
  note: string;
  createdAt: string;
  recruiter: { name: string };
};

export type InterviewMode = "ONLINE" | "ONSITE" | "PHONE";
export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type Interview = {
  id: string;
  applicationId: string;
  scheduledAt: string;
  mode: InterviewMode;
  locationOrUrl?: string | null;
  notes?: string | null;
  status: InterviewStatus;
};

const json = (body: unknown) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export function searchCandidates(params: {
  skill?: string;
  location?: string;
  experienceMin?: number;
  experienceMax?: number;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return apiRequest<{ profiles: CandidateSearchResult[]; pagination: Pagination }>(
    `/api/recruiter-tools/candidates/search?${q.toString()}`
  );
}

export function listNotes(applicationId: string) {
  return apiRequest<{ notes: ApplicationNote[] }>(`/api/recruiter-tools/applications/${applicationId}/notes`);
}
export function addNote(applicationId: string, note: string) {
  return apiRequest<{ note: ApplicationNote }>(`/api/recruiter-tools/applications/${applicationId}/notes`, {
    method: "POST",
    ...json({ note }),
  });
}
export function deleteNote(id: string) {
  return apiRequest<null>(`/api/recruiter-tools/notes/${id}`, { method: "DELETE" });
}

export function listInterviews(applicationId: string) {
  return apiRequest<{ interviews: Interview[] }>(`/api/recruiter-tools/applications/${applicationId}/interviews`);
}
export function scheduleInterview(
  applicationId: string,
  input: { scheduledAt: string; mode: InterviewMode; locationOrUrl?: string; notes?: string }
) {
  return apiRequest<{ interview: Interview }>(`/api/recruiter-tools/applications/${applicationId}/interviews`, {
    method: "POST",
    ...json(input),
  });
}
export function cancelInterview(id: string) {
  return apiRequest<{ interview: Interview }>(`/api/recruiter-tools/interviews/${id}/cancel`, { method: "POST" });
}