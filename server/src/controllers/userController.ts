import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { updateProfileSchema } from "../schemas/users.js";
import { formatMembership, getActiveMembership } from "../utils/membership.js";
import { User } from "@prisma/client";

function sanitizeUser(user: User) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function getMeProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  try {
    const userWithMemberships = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        memberships: {
          include: {
            plan: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!userWithMemberships) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const formattedMemberships = userWithMemberships.memberships.map(formatMembership);
    const activeMembership = getActiveMembership(userWithMemberships.memberships);

    res.status(200).json({
      data: {
        user: sanitizeUser(userWithMemberships),
        activeMembership,
        memberships: formattedMemberships,
      },
    });
  } catch (error) {
    console.error("getMeProfile error:", error);
    res.status(500).json({ error: "Internal server error retrieving profile" });
  }
}

export async function updateMeProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  try {
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: parseResult.data,
    });

    res.status(200).json({
      data: {
        user: sanitizeUser(updatedUser),
      },
    });
  } catch (error) {
    console.error("updateMeProfile error:", error);
    res.status(500).json({ error: "Internal server error updating profile" });
  }
}

export async function selfAssignMembership(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  try {
    const { planId } = req.body;
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) {
      res.status(404).json({ error: "Subscription plan not found or inactive" });
      return;
    }

    const startsAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const membership = await prisma.membership.create({
      data: {
        memberId: req.user.id,
        planId: plan.id,
        startsAt,
        expiresAt,
        notes: "Self-subscribed via member portal",
      },
      include: { plan: true },
    });

    res.status(201).json({ data: { membership } });
  } catch (error) {
    console.error("selfAssignMembership error:", error);
    res.status(500).json({ error: "Internal server error selecting membership plan" });
  }
}
