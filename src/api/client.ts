export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "evogym_token";

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (!(options?.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg) as Error & { status?: number; details?: any };
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export function apiGet<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "GET" });
}

export function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  const options: RequestInit = { method: "POST" };
  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  return request<T>(endpoint, options);
}

export function apiPatch<T>(endpoint: string, body?: any): Promise<T> {
  const options: RequestInit = { method: "PATCH" };
  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  return request<T>(endpoint, options);
}

export function apiPut<T>(endpoint: string, body?: any): Promise<T> {
  const options: RequestInit = { method: "PUT" };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  return request<T>(endpoint, options);
}

export function apiDelete<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "DELETE" });
}
