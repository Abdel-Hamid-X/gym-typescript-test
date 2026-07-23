import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { adminUserQuerySchema, adminUpdateUserSchema } from "../schemas/users.js";
import { assignMembershipSchema, extendMembershipSchema } from "../schemas/memberships.js";
import { formatMembership, getActiveMembership } from "../utils/membership.js";
import { User, Prisma, MembershipStatus } from "@prisma/client";

function sanitizeUser(user: User) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = adminUserQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid query parameters", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const { role, search, page, pageSize } = parseResult.data;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          memberships: {
            include: { plan: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => {
      const formattedMemberships = u.memberships.map(formatMembership);
      const activeMembership = getActiveMembership(u.memberships);
      return {
        ...sanitizeUser(u),
        activeMembership,
        memberships: formattedMemberships,
      };
    });

    res.status(200).json({
      data: {
        users: formattedUsers,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      },
    });
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ error: "Internal server error retrieving users" });
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const formattedMemberships = user.memberships.map(formatMembership);
    const activeMembership = getActiveMembership(user.memberships);

    res.status(200).json({
      data: {
        user: sanitizeUser(user),
        activeMembership,
        memberships: formattedMemberships,
      },
    });
  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({ error: "Internal server error retrieving user details" });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = adminUpdateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: parseResult.data,
    });

    res.status(200).json({ data: { user: sanitizeUser(updatedUser) } });
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({ error: "Internal server error updating user" });
  }
}

export async function deactivateUser(req: Request, res: Response): Promise<void> {
  try {
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.params.id },
        data: { active: false },
      }),
      prisma.session.deleteMany({
        where: { userId: req.params.id },
      }),
    ]);

    res.status(200).json({
      data: {
        user: sanitizeUser(updatedUser),
        message: "User deactivated and sessions terminated.",
      },
    });
  } catch (error) {
    console.error("deactivateUser error:", error);
    res.status(500).json({ error: "Internal server error deactivating user" });
  }
}

export async function reactivateUser(req: Request, res: Response): Promise<void> {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { active: true },
    });

    res.status(200).json({
      data: {
        user: sanitizeUser(updatedUser),
        message: "User reactivated successfully.",
      },
    });
  } catch (error) {
    console.error("reactivateUser error:", error);
    res.status(500).json({ error: "Internal server error reactivating user" });
  }
}

export async function getUserMemberships(req: Request, res: Response): Promise<void> {
  try {
    const memberships = await prisma.membership.findMany({
      where: { memberId: req.params.userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ data: { memberships: memberships.map(formatMembership) } });
  } catch (error) {
    console.error("getUserMemberships error:", error);
    res.status(500).json({ error: "Internal server error retrieving memberships" });
  }
}

export async function assignMembership(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = assignMembershipSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const { planId, startsAt, expiresAt, notes } = parseResult.data;
    const userId = req.params.userId;

    const [user, plan] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.subscriptionPlan.findUnique({ where: { id: planId } }),
    ]);

    if (!user) {
      res.status(404).json({ error: "Target user not found" });
      return;
    }
    if (!plan || !plan.active) {
      res.status(404).json({ error: "Subscription plan not found or inactive" });
      return;
    }

    const membership = await prisma.membership.create({
      data: {
        memberId: userId,
        planId,
        startsAt,
        expiresAt,
        notes: notes || null,
        assignedBy: req.user!.id,
        status: MembershipStatus.ACTIVE,
      },
      include: { plan: true },
    });

    res.status(201).json({ data: { membership: formatMembership(membership) } });
  } catch (error) {
    console.error("assignMembership error:", error);
    res.status(500).json({ error: "Internal server error assigning membership" });
  }
}

export async function cancelMembership(req: Request, res: Response): Promise<void> {
  try {
    const membership = await prisma.membership.update({
      where: { id: req.params.id },
      data: { status: MembershipStatus.CANCELLED },
      include: { plan: true },
    });

    res.status(200).json({ data: { membership: formatMembership(membership) } });
  } catch (error) {
    console.error("cancelMembership error:", error);
    res.status(500).json({ error: "Internal server error cancelling membership" });
  }
}

export async function extendMembership(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = extendMembershipSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const { expiresAt, notes } = parseResult.data;

    const membership = await prisma.membership.update({
      where: { id: req.params.id },
      data: {
        expiresAt,
        notes: notes !== undefined ? notes : undefined,
      },
      include: { plan: true },
    });

    res.status(200).json({ data: { membership: formatMembership(membership) } });
  } catch (error) {
    console.error("extendMembership error:", error);
    res.status(500).json({ error: "Internal server error extending membership" });
  }
}
