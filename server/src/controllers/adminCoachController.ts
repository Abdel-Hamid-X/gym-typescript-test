import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { createCoachSchema, updateCoachProfileSchema } from "../schemas/coaches.js";
import argon2 from "argon2";
import { Role, User } from "@prisma/client";

function sanitizeUser(user: User) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function createCoach(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createCoachSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const { name, email, password, specialization, bio, avatarUrl } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "User with this email already exists" });
      return;
    }

    const passwordHash = await argon2.hash(password);

    const [user, coachProfile] = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: Role.COACH,
          avatarUrl: avatarUrl || null,
        },
      });

      const newProfile = await tx.coachProfile.create({
        data: {
          userId: newUser.id,
          specialization,
          bio,
        },
      });

      return [newUser, newProfile];
    });

    res.status(201).json({
      data: {
        coach: {
          ...sanitizeUser(user),
          coachProfile,
        },
      },
    });
  } catch (error) {
    console.error("createCoach error:", error);
    res.status(500).json({ error: "Internal server error creating coach account" });
  }
}

export async function updateCoachProfileByAdmin(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = updateCoachProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const { specialization, bio, avatarUrl } = parseResult.data;
    const userId = req.params.id;

    const user = await prisma.user.findFirst({ where: { id: userId, role: Role.COACH } });
    if (!user) {
      res.status(404).json({ error: "Coach account not found" });
      return;
    }

    if (avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
      });
    }

    const coachProfile = await prisma.coachProfile.upsert({
      where: { userId },
      update: {
        ...(specialization !== undefined ? { specialization } : {}),
        ...(bio !== undefined ? { bio } : {}),
      },
      create: {
        userId,
        specialization: specialization || "General Fitness",
        bio: bio || "Coach bio not set up yet.",
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { coachProfile: true },
    });

    res.status(200).json({
      data: {
        coach: {
          ...sanitizeUser(updatedUser!),
          coachProfile,
        },
      },
    });
  } catch (error) {
    console.error("updateCoachProfileByAdmin error:", error);
    res.status(500).json({ error: "Internal server error updating coach profile" });
  }
}
