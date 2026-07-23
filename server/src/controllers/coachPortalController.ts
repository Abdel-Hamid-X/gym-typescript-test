import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { updateCoachProfileSchema } from "../schemas/coaches.js";
import { createScheduleSchema, updateScheduleSchema } from "../schemas/classes.js";
import { User } from "@prisma/client";

function sanitizeUser(user: User) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function getMyAssignedClasses(req: Request, res: Response): Promise<void> {
  try {
    const classes = await prisma.gymClass.findMany({
      where: {
        coachId: req.user!.id,
        active: true,
      },
      include: {
        schedules: {
          where: { active: true },
          orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({ data: { classes } });
  } catch (error) {
    console.error("getMyAssignedClasses error:", error);
    res.status(500).json({ error: "Internal server error retrieving assigned classes" });
  }
}

export async function updateMyCoachProfile(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = updateCoachProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const { specialization, bio, avatarUrl } = parseResult.data;

    if (avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { avatarUrl },
      });
    }

    const coachProfile = await prisma.coachProfile.upsert({
      where: { userId: req.user!.id },
      update: {
        ...(specialization !== undefined ? { specialization } : {}),
        ...(bio !== undefined ? { bio } : {}),
      },
      create: {
        userId: req.user!.id,
        specialization: specialization || "General Fitness",
        bio: bio || "Coach bio not set up yet.",
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
    console.error("updateMyCoachProfile error:", error);
    res.status(500).json({ error: "Internal server error updating coach profile" });
  }
}

export async function createScheduleForMyClass(req: Request, res: Response): Promise<void> {
  try {
    const { classId } = req.params;
    const gymClass = await prisma.gymClass.findUnique({ where: { id: classId } });

    if (!gymClass || !gymClass.active) {
      res.status(404).json({ error: "Class not found" });
      return;
    }
    if (gymClass.coachId !== req.user!.id) {
      res.status(403).json({ error: "You are not authorized to modify schedules for this class" });
      return;
    }

    const parseResult = createScheduleSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const schedule = await prisma.classSchedule.create({
      data: {
        ...parseResult.data,
        classId,
      },
    });

    res.status(201).json({ data: { schedule } });
  } catch (error) {
    console.error("createScheduleForMyClass error:", error);
    res.status(500).json({ error: "Internal server error creating schedule" });
  }
}

export async function updateScheduleForMyClass(req: Request, res: Response): Promise<void> {
  try {
    const { scheduleId } = req.params;
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: { gymClass: true },
    });

    if (!schedule || !schedule.gymClass.active) {
      res.status(404).json({ error: "Schedule slot not found" });
      return;
    }
    if (schedule.gymClass.coachId !== req.user!.id) {
      res.status(403).json({ error: "You are not authorized to modify schedules for this class" });
      return;
    }

    const parseResult = updateScheduleSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const updatedSchedule = await prisma.classSchedule.update({
      where: { id: scheduleId },
      data: parseResult.data,
    });

    res.status(200).json({ data: { schedule: updatedSchedule } });
  } catch (error) {
    console.error("updateScheduleForMyClass error:", error);
    res.status(500).json({ error: "Internal server error updating schedule" });
  }
}

export async function deleteScheduleForMyClass(req: Request, res: Response): Promise<void> {
  try {
    const { scheduleId } = req.params;
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: { gymClass: true },
    });

    if (!schedule) {
      res.status(404).json({ error: "Schedule slot not found" });
      return;
    }
    if (schedule.gymClass.coachId !== req.user!.id) {
      res.status(403).json({ error: "You are not authorized to modify schedules for this class" });
      return;
    }

    await prisma.classSchedule.delete({ where: { id: scheduleId } });

    res.status(200).json({ data: { message: "Schedule slot deleted successfully" } });
  } catch (error) {
    console.error("deleteScheduleForMyClass error:", error);
    res.status(500).json({ error: "Internal server error deleting schedule" });
  }
}
