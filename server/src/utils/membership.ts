import { Membership, MembershipStatus } from "@prisma/client";

export function computeMembershipStatus(membership: Membership): MembershipStatus {
  if (membership.status === MembershipStatus.CANCELLED) {
    return MembershipStatus.CANCELLED;
  }
  if (membership.expiresAt.getTime() <= Date.now()) {
    return MembershipStatus.EXPIRED;
  }
  return membership.status;
}

export function formatMembership<T extends Membership>(membership: T): T & { computedStatus: MembershipStatus } {
  return {
    ...membership,
    computedStatus: computeMembershipStatus(membership),
  };
}

export function getActiveMembership<T extends Membership>(memberships: T[]): (T & { computedStatus: MembershipStatus }) | null {
  const activeList = memberships
    .map(formatMembership)
    .filter((m) => m.computedStatus === MembershipStatus.ACTIVE)
    .sort((a, b) => b.expiresAt.getTime() - a.expiresAt.getTime());

  return activeList[0] || null;
}
