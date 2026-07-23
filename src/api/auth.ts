import { apiGet, apiPost } from "./client";

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: "MEMBER" | "COACH" | "ADMIN";
  phoneNumber?: string | null;
  personalGoals?: string | null;
  avatarUrl?: string | null;
  active: boolean;
  activeMembership?: {
    id: string;
    status: string;
    startsAt: string;
    expiresAt: string;
    plan: {
      id: string;
      name: string;
      priceCents: number;
      description: string;
      features: string[];
    };
  } | null;
  coachProfile?: {
    id: string;
    specialization: string;
    bio: string;
  } | null;
}

export async function fetchMe(): Promise<{ user: BackendUser }> {
  const res = await apiGet<{ data: { user: BackendUser } }>("/auth/me");
  return res.data;
}

export async function loginRequest(email: string, password: string): Promise<{ user: BackendUser; token: string }> {
  const res = await apiPost<{ data: { user: BackendUser; token: string } }>("/auth/login", { email, password });
  return res.data;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string
): Promise<{ user: BackendUser; token: string }> {
  const res = await apiPost<{ data: { user: BackendUser; token: string } }>("/auth/register", { name, email, password });
  return res.data;
}

export async function logoutRequest(): Promise<void> {
  await apiPost("/auth/logout").catch(() => {});
}
