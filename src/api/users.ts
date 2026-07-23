import { apiGet, apiPatch, apiPost } from "./client";
import { BackendUser } from "./auth";

export async function updateMeProfileRequest(data: {
  name?: string;
  phoneNumber?: string;
  personalGoals?: string;
  avatarUrl?: string;
}): Promise<{ user: BackendUser }> {
  const res = await apiPatch<{ data: { user: BackendUser } }>("/users/me", data);
  return res.data;
}

export async function fetchAdminUsers(role?: string, search?: string): Promise<{ users: BackendUser[] }> {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (search) params.set("search", search);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await apiGet<{ data: { users: BackendUser[] } }>(`/admin/users${queryString}`);
  return res.data;
}

export async function deactivateUserRequest(id: string): Promise<{ user: BackendUser }> {
  const res = await apiPost<{ data: { user: BackendUser } }>(`/admin/users/${id}/deactivate`);
  return res.data;
}

export async function reactivateUserRequest(id: string): Promise<{ user: BackendUser }> {
  const res = await apiPost<{ data: { user: BackendUser } }>(`/admin/users/${id}/reactivate`);
  return res.data;
}
