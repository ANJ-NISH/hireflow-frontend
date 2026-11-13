import { apiRequest } from "./client";

export type Resume = {
  id: string;
  candidateId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  isPrimary: boolean;
  createdAt: string;
};

export const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const RESUME_ACCEPT = ".pdf,.doc,.docx";
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_RESUMES = 5;

export function validateResumeFile(file: File): string | null {
  if (!ALLOWED_RESUME_TYPES.includes(file.type)) return "Only PDF and Word documents are allowed.";
  if (file.size > MAX_RESUME_SIZE_BYTES) return "File must be 5MB or smaller.";
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const json = (body: unknown) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export function listMyResumes() {
  return apiRequest<{ resumes: Resume[] }>("/api/resumes/mine");
}
export function setPrimaryResume(id: string) {
  return apiRequest<null>(`/api/resumes/${id}/set-primary`, { method: "POST" });
}
export function deleteResume(id: string) {
  return apiRequest<null>(`/api/resumes/${id}`, { method: "DELETE" });
}
export function getMyResumeDownloadUrl(id: string) {
  return apiRequest<{ downloadUrl: string }>(`/api/resumes/${id}/download-url`);
}
export function getApplicantResumeDownloadUrl(applicationId: string) {
  return apiRequest<{ downloadUrl: string; filename: string }>(
    `/api/applications/${applicationId}/resume-download-url`
  );
}

function requestUploadUrl(input: { filename: string; contentType: string; sizeBytes: number }) {
  return apiRequest<{ uploadUrl: string; storageKey: string }>("/api/resumes/upload-url", {
    method: "POST",
    ...json(input),
  });
}

function confirmUpload(input: { storageKey: string; originalFilename: string }) {
  return apiRequest<{ resume: Resume }>("/api/resumes/confirm", {
    method: "POST",
    ...json(input),
  });
}


function putToStorage(url: string, file: File, onProgress?: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    // Must match the contentType we asked the backend to sign, exactly
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("The file could not be uploaded. Please try again."));
    };
    xhr.onerror = () => reject(new Error("Could not reach file storage. Check your connection and try again."));

    xhr.send(file);
  });
}

export async function uploadResumeFile(file: File, onProgress?: (percent: number) => void): Promise<Resume> {
  const problem = validateResumeFile(file);
  if (problem) throw new Error(problem);

  const { uploadUrl, storageKey } = await requestUploadUrl({
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  });

  await putToStorage(uploadUrl, file, onProgress);

  const { resume } = await confirmUpload({ storageKey, originalFilename: file.name });
  return resume;
}

export async function openInNewTab(getUrl: () => Promise<string>) {
  const win = window.open("", "_blank");
  try {
    const url = await getUrl();
    if (win) win.location.href = url;
    else window.location.href = url;
  } catch (err) {
    win?.close();
    throw err;
  }
}