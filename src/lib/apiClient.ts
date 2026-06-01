import { isSupabaseConfigured, supabase } from "./supabase";

type ApiOptions = RequestInit & {
  auth?: boolean | "optional";
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function authHeader(auth?: boolean): Promise<Record<string, string>> {
  if (!auth) return {};
  if (!isSupabaseConfigured || !supabase) {
    throw new ApiError("Please log in before saving.", 401);
  }

  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) {
    throw new ApiError("Please log in before saving.", 401);
  }

  return { Authorization: `Bearer ${token}` };
}

async function optionalAuthHeader(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured || !supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.auth === "optional" ? await optionalAuthHeader() : await authHeader(options.auth)),
    ...(options.headers || {}),
  };

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = response.statusText || "Request failed.";
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Keep the HTTP status text if the response is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string, options: ApiOptions = {}) {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(path: string, body: unknown, options: ApiOptions = {}) {
  return apiRequest<T>(path, { ...options, method: "POST", body: JSON.stringify(body) });
}

export function apiPatch<T>(path: string, body: unknown, options: ApiOptions = {}) {
  return apiRequest<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown, options: ApiOptions = {}) {
  return apiRequest<T>(path, { ...options, method: "PUT", body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string, options: ApiOptions = {}) {
  return apiRequest<T>(path, { ...options, method: "DELETE" });
}
