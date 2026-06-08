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

export function userFriendlyErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw = error instanceof Error ? error.message : String(error || "");
  const lower = raw.toLowerCase();

  if (!raw) return fallback;
  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("load failed") || lower.includes("network request failed")) {
    return "The server is not reachable right now. Please try again in a moment.";
  }
  if (lower.includes("login required") || lower.includes("invalid or expired session") || lower.includes("jwt") || lower.includes("authorization")) {
    return "Please log in again to continue.";
  }
  if (lower.includes("duplicate") || lower.includes("already") || lower.includes("unique constraint")) {
    return "This has already been submitted.";
  }
  if (lower.includes("violates row-level security") || lower.includes("permission denied") || lower.includes("403")) {
    return "You do not have permission to do that.";
  }
  if (lower.includes("foreign key") || lower.includes("profile not found")) {
    return "Your account profile is still being prepared. Please refresh and try again.";
  }
  if (lower.includes("schema cache") || lower.includes("column") || lower.includes("relation") || lower.includes("supabase") || lower.includes("postgres") || lower.includes("null value") || lower.includes("internal server error")) {
    return fallback;
  }
  if (raw.length > 180 || /[{}[\]();]/.test(raw)) return fallback;
  return raw;
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

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError(
      userFriendlyErrorMessage(error, "The server is not reachable right now. Please try again in a moment."),
      503
    );
  }

  if (!response.ok) {
    let message = response.statusText || "Request failed.";
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Keep the HTTP status text if the response is not JSON.
    }
    throw new ApiError(userFriendlyErrorMessage(message, response.status >= 500 ? "The server could not complete that request. Please try again soon." : message), response.status);
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
