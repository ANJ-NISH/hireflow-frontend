import { apiRequest } from "./client";
import type { Pagination } from "./job";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER" | "ADMIN";
  isSuspended: boolean;
  isEmailVerified: boolean;
  createdAt: string;
};

export type AdminCompany = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  recruiterId: string;
  isApproved: boolean;
  createdAt: string;
  recruiter: { name: string; email: string };
  _count: { jobs: number };
};

export type AdminJob = {
  id: string;
  title: string;
  location: string;
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  status: "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED";
  createdAt: string;
  company: { name: string; recruiterId: string };
};

export type ComplaintTargetType = "JOB" | "USER" | "COMPANY";
export type ComplaintStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type Complaint = {
  id: string;
  reporterId: string;
  targetType: ComplaintTargetType;
  targetId: string;
  reason: string;
  status: ComplaintStatus;
  adminNote?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  reporter: { name: string; email: string };
};

export type AdminStats = {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  pendingCompanies: number;
  totalJobs: number;
  publishedJobs: number;
  totalApplications: number;
  openComplaints: number;
};

function toQuery(params: Record<string, unknown>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return q.toString();
}

export function getStats() {
  return apiRequest<AdminStats>("/api/admin/stats");
}

export function listUsers(params: { role?: string; isSuspended?: boolean; search?: string; page?: number; limit?: number } = {}) {
  return apiRequest<{ users: AdminUser[]; pagination: Pagination }>(`/api/admin/users?${toQuery(params)}`);
}
export function suspendUser(id: string, reason?: string) {
  return apiRequest<null>(`/api/admin/users/${id}/suspend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}
export function unsuspendUser(id: string) {
  return apiRequest<null>(`/api/admin/users/${id}/unsuspend`, { method: "POST" });
}

export function listCompanies(params: { isApproved?: boolean; page?: number; limit?: number } = {}) {
  return apiRequest<{ companies: AdminCompany[]; pagination: Pagination }>(`/api/admin/companies?${toQuery(params)}`);
}
export function approveCompany(id: string) {
  return apiRequest<{ company: AdminCompany }>(`/api/admin/companies/${id}/approve`, { method: "POST" });
}
export function rejectCompany(id: string) {
  return apiRequest<{ company: AdminCompany }>(`/api/admin/companies/${id}/reject`, { method: "POST" });
}

export function listAllJobs(params: { status?: string; page?: number; limit?: number } = {}) {
  return apiRequest<{ jobs: AdminJob[]; pagination: Pagination }>(`/api/admin/jobs?${toQuery(params)}`);
}
export function removeJob(id: string) {
  return apiRequest<{ job: AdminJob }>(`/api/admin/jobs/${id}/remove`, { method: "POST" });
}

export function listComplaints(params: { status?: string; page?: number; limit?: number } = {}) {
  return apiRequest<{ complaints: Complaint[]; pagination: Pagination }>(`/api/admin/complaints?${toQuery(params)}`);
}
export function resolveComplaint(id: string, status: "RESOLVED" | "DISMISSED", adminNote?: string) {
  return apiRequest<{ complaint: Complaint }>(`/api/admin/complaints/${id}/resolve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, adminNote }),
  });
}