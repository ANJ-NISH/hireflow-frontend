const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function post(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "Request failed") as Error & { errors?: Record<string, string[]> };
    err.errors = data.errors;
    throw err;
  }

  return data;
}

export function verifyEmail(email: string, token: string) {
  return post("/api/auth/verify-email", { email, token });
}

export function resendVerification(email: string) {
  return post("/api/auth/resend-verification", { email });
}

export function forgotPassword(email: string) {
  return post("/api/auth/forgot-password", { email });
}

export function resetPassword(email: string, token: string, newPassword: string) {
  return post("/api/auth/reset-password", { email, token, newPassword });
}