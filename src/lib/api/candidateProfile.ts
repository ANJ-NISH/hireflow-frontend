import { apiRequest } from "./client";

export type Experience = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startDate: string;
  endDate?: string | null;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  url?: string | null;
};

export type Project = {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  techStack: string[];
};

export type CandidateProfile = {
  id: string;
  userId: string;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  skills: string[];
  languages: string[];
  resumeUrl?: string | null;
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  projects: Project[];
  totalExperienceYears?: number | null;
  isSearchable?: boolean;
};

export type ProfileInput = Partial<{
  headline: string;
  bio: string;
  location: string;
  phone: string;
  skills: string[];
  languages: string[];
  resumeUrl: string;
  totalExperienceYears: number;
  isSearchable: boolean;
}>;

export type ExperienceInput = Omit<Experience, "id">;
export type EducationInput = Omit<Education, "id">;
export type CertificationInput = Omit<Certification, "id">;
export type ProjectInput = Omit<Project, "id">;

const json = (body: unknown) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export function getMyProfile() {
  return apiRequest<{ profile: CandidateProfile }>("/api/candidates/me");
}

export function updateMyProfile(input: ProfileInput) {
  return apiRequest<{ profile: CandidateProfile }>("/api/candidates/me", { method: "PATCH", ...json(input) });
}

export function addExperience(input: ExperienceInput) {
  return apiRequest<{ experience: Experience }>("/api/candidates/me/experience", { method: "POST", ...json(input) });
}
export function deleteExperience(id: string) {
  return apiRequest<null>(`/api/candidates/me/experience/${id}`, { method: "DELETE" });
}

export function addEducation(input: EducationInput) {
  return apiRequest<{ education: Education }>("/api/candidates/me/education", { method: "POST", ...json(input) });
}
export function deleteEducation(id: string) {
  return apiRequest<null>(`/api/candidates/me/education/${id}`, { method: "DELETE" });
}

export function addCertification(input: CertificationInput) {
  return apiRequest<{ certification: Certification }>("/api/candidates/me/certifications", { method: "POST", ...json(input) });
}
export function deleteCertification(id: string) {
  return apiRequest<null>(`/api/candidates/me/certifications/${id}`, { method: "DELETE" });
}

export function addProject(input: ProjectInput) {
  return apiRequest<{ project: Project }>("/api/candidates/me/projects", { method: "POST", ...json(input) });
}
export function deleteProject(id: string) {
  return apiRequest<null>(`/api/candidates/me/projects/${id}`, { method: "DELETE" });
}

export function getCandidateProfileByUserId(userId: string) {
  return apiRequest<{ profile: CandidateProfile; contactVisible: boolean }>(`/api/candidates/${userId}`);
}