import { apiRequest } from "./client";

export type Company = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
};

export type CompanyInput = {
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
};

export function createCompany(input: CompanyInput) {
  return apiRequest<{ company: Company }>("/api/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function getMyCompany() {
  return apiRequest<{ company: Company }>("/api/companies/me");
}

export function updateMyCompany(input: Partial<CompanyInput>) {
  return apiRequest<{ company: Company }>("/api/companies/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}