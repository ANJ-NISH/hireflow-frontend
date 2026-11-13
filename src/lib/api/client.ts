import { apiFetch } from "../auth";

export class ApiError extends Error {
  errors?: Record<string, string[]>;
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.errors = errors;
  }
}

// Wraps apiFetch + JSON parsing + error handling in one place, so every
// API function below stays a one-liner instead of repeating this boilerplate.
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.message || "Request failed", data.errors);
  }

  return data.data as T;
}