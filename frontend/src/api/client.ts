/** Base URL for API calls. Empty = same origin (Vite dev proxy to :5000). Set VITE_API_BASE_URL when the SPA is served without a proxy (e.g. static nginx on another port). */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return raw?.replace(/\/$/, "") ?? "";
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`HTTP ${status}`);
    this.name = "ApiError";
  }
}

type ProblemBody = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

export function getProblemMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "Request failed";
  const p = body as ProblemBody;
  if (typeof p.detail === "string" && p.detail.trim()) return p.detail;
  if (typeof p.title === "string" && p.title.trim()) return p.title;
  return "Request failed";
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { detail: text.slice(0, 200) };
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}
