import { apiRequest } from "./client";

export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export type Application = {
  id: string;
  jobId: string;
  candidateId: string;
  resumeUrl?: string | null;
  resumeId?: string | null;
  coverLetter?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type MyApplication = Application & {
  job: {
    id: string;
    title: string;
    location: string;
    workMode: "REMOTE" | "HYBRID" | "ONSITE";
    status: string;
    company: { name: string; logoUrl?: string | null };
  };
};

export type Applicant = Application & {
  candidate: { id: string; name: string; email: string };
};

export function applyToJob(jobId: string, input: { resumeId?: string; coverLetter?: string }) {
  return apiRequest<{ application: Application }>(`/api/applications/jobs/${jobId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function listMyApplications() {
  return apiRequest<{ applications: MyApplication[] }>("/api/applications/mine");
}

export function withdrawApplication(id: string) {
  return apiRequest<{ application: Application }>(`/api/applications/${id}/withdraw`, {
    method: "POST",
  });
}

export function listApplicantsForJob(jobId: string) {
  return apiRequest<{ applications: Applicant[] }>(`/api/applications/jobs/${jobId}/applicants`);
}

export function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return apiRequest<{ application: Application }>(`/api/applications/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}