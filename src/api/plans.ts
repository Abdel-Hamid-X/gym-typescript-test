import { apiGet, apiPost } from "./client";

export interface BackendPlan {
  id: string;
  name: string;
  priceCents: number;
  billingPeriod: string;
  description: string;
  features: string[];
  active: boolean;
}

export async function fetchPlans(): Promise<{ plans: BackendPlan[] }> {
  const res = await apiGet<{ data: { plans: BackendPlan[] } }>("/plans");
  return res.data;
}

export async function assignMembershipRequest(
  userId: string,
  planId: string,
  startsAt: string,
  expiresAt: string,
  notes?: string
): Promise<{ membership: any }> {
  const res = await apiPost<{ data: { membership: any } }>(`/admin/users/${userId}/memberships`, {
    planId,
    startsAt,
    expiresAt,
    notes,
  });
  return res.data;
}

export async function extendMembershipRequest(
  membershipId: string,
  newExpiresAt: string,
  notes?: string
): Promise<{ membership: any }> {
  const res = await apiPost<{ data: { membership: any } }>(`/admin/memberships/${membershipId}/extend`, {
    newExpiresAt,
    notes,
  });
  return res.data;
}

export async function cancelMembershipRequest(membershipId: string, notes?: string): Promise<{ membership: any }> {
  const res = await apiPost<{ data: { membership: any } }>(`/admin/memberships/${membershipId}/cancel`, { notes });
  return res.data;
}

export async function selfAssignMembershipRequest(planId: string): Promise<any> {
  const res = await apiPost<{ data: { membership: any } }>("/users/me/memberships", { planId });
  return res.data;
}
