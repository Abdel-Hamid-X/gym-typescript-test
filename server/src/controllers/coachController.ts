import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { Role, User } from "@prisma/client";

function sanitizeUser(user: User) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function getCoaches(req: Request, res: Response): Promise<void> {
  try {
    const coaches = await prisma.user.findMany({
      where: {
        role: Role.COACH,
        active: true,
      },
      include: {
        coachProfile: true,
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      data: {
        coaches: coaches.map((c) => ({
          ...sanitizeUser(c),
          coachProfile: c.coachProfile,
        })),
      },
    });
  } catch (error) {
    console.error("getCoaches error:", error);
    res.status(500).json({ error: "Internal server error retrieving coaches" });
  }
}

export async function getCoachById(req: Request, res: Response): Promise<void> {
  try {
    const coach = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        role: Role.COACH,
      },
      include: {
        coachProfile: true,
        assignedClasses: {
          where: { active: true },
          include: {
            schedules: { where: { active: true } },
          },
        },
      },
    });

    if (!coach || !coach.active) {
      res.status(404).json({ error: "Coach not found" });
      return;
    }

    res.status(200).json({
      data: {
        coach: {
          ...sanitizeUser(coach),
          coachProfile: coach.coachProfile,
          assignedClasses: coach.assignedClasses,
        },
      },
    });
  } catch (error) {
    console.error("getCoachById error:", error);
    res.status(500).json({ error: "Internal server error retrieving coach details" });
  }
}
