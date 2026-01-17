/**
 * http.ts
 * Fetch wrapper + auth token helpers + safe URL join for API + media URLs.
 */
const RAW_API_BASE: string =
  (import.meta as any).env?.VITE_API_BASE?.toString() || "http://localhost:4000";

// normalize base: no trailing slash
const API_BASE = RAW_API_BASE.endsWith("/") ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;

export function getApiBase() {
  return API_BASE;
}

/**
 * Safely join API base + backend-provided path.
 * Handles:
 *  - "/uploads/x.png"
 *  - "uploads/x.png"
 *  - "http(s)://..."
 */
export function toApiUrl(path: string) {
  if (!path) return API_BASE;

  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // If backend stored "uploads/..." without leading slash, fix it
  const normalized = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE}${normalized}`;
}

export function getToken(): string | null {
  return localStorage.getItem("admin_token");
}
export function setToken(token: string) {
  localStorage.setItem("admin_token", token);
}
export function clearToken() {
  localStorage.removeItem("admin_token");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(toApiUrl(path), init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    }),
  delete: <T>(path: string, token: string) =>
    request<T>(path, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }),
  postForm: <T>(path: string, form: FormData, token: string) =>
    request<T>(path, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    })
};
