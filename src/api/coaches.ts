import { apiGet, apiPatch, apiPost } from "./client";
import { BackendUser } from "./auth";

export async function fetchCoaches(): Promise<{ coaches: BackendUser[] }> {
  const res = await apiGet<{ data: { coaches: BackendUser[] } }>("/coaches");
  return res.data;
}

export async function fetchCoachById(id: string): Promise<{ coach: BackendUser }> {
  const res = await apiGet<{ data: { coach: BackendUser } }>(`/coaches/${id}`);
  return res.data;
}

export async function createCoachByAdmin(input: {
  name: string;
  email: string;
  password: string;
  specialization: string;
  bio: string;
  avatarUrl?: string;
}): Promise<{ coach: BackendUser }> {
  const res = await apiPost<{ data: { coach: BackendUser } }>("/admin/coaches", input);
  return res.data;
}

export async function updateCoachProfileByAdmin(
  id: string,
  input: { specialization?: string; bio?: string; avatarUrl?: string }
): Promise<{ coach: BackendUser }> {
  const res = await apiPatch<{ data: { coach: BackendUser } }>(`/admin/coaches/${id}/profile`, input);
  return res.data;
}

export async function updateMyCoachProfileRequest(input: {
  specialization?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<{ coach: BackendUser }> {
  const res = await apiPatch<{ data: { coach: BackendUser } }>("/coach/me", input);
  return res.data;
}

export async function fetchMyCoachClasses(): Promise<{ classes: any[] }> {
  const res = await apiGet<{ data: { classes: any[] } }>("/coach/classes");
  return res.data;
}
