export type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER" | "ADMIN";
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Access token lives in memory for the current tab session — fastest, and
// disappears automatically on a hard refresh, which is fine because we
// silently re-fetch a new one from the refreshToken cookie on load (see initAuth).
let accessToken: string | null = null;

// Tracks an in-flight refresh request so concurrent callers share it
// instead of each firing their own /api/auth/refresh call. This is what
// prevents the token-rotation race condition.
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem("hireflow_user");
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn(): boolean {
  return !!accessToken;
}

// Called after successful login/register/refresh
export function setAuth(token: string, user: StoredUser) {
  accessToken = token;
  localStorage.setItem("hireflow_user", JSON.stringify(user));
}

export function clearAuth() {
  accessToken = null;
  localStorage.removeItem("hireflow_user");
}

let refreshFailedTemporarily = false;

async function doRefresh(): Promise<string | null> {
  refreshFailedTemporarily = false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 401) clearAuth(); // the session is truly gone
      else refreshFailedTemporarily = true; // 429 / 5xx: keep the user signed in and retry later
      return null;
    }

    const data = await res.json();
    accessToken = data.data.accessToken;
    return accessToken;
  } catch {
    refreshFailedTemporarily = true; // network problem, not a dead session
    return null;
  }
}

// Public entry point — if a refresh is already in flight, every caller
// awaits that same promise instead of starting a new one.
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null; // clear once settled, so the *next* refresh can start fresh
    });
  }
  return refreshPromise;
}

// Call this once when the app first loads (e.g. in App.tsx) to silently restore
// a session from the refreshToken cookie, without the user having to log in again.
export async function initAuth(): Promise<void> {
  const user = getUser();
  if (!user) return;

  const token = await refreshAccessToken();
  if (!token && !refreshFailedTemporarily) {
    clearAuth();
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    // Clear local state regardless of whether the network call succeeded —
    // the user should always end up logged out on their own device.
    clearAuth();
  }
}

// Fetch wrapper: attaches the access token, and if the server says it's expired (401),
// transparently refreshes once and retries the original request before giving up.
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  return res;
}