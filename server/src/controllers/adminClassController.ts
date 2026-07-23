import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import {
  createClassSchema,
  updateClassSchema,
  assignCoachSchema,
  createScheduleSchema,
  updateScheduleSchema,
} from "../schemas/classes.js";
import { Role } from "@prisma/client";

export async function createClass(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createClassSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    if (parseResult.data.coachId) {
      const coach = await prisma.user.findFirst({ where: { id: parseResult.data.coachId, role: Role.COACH } });
      if (!coach) {
        res.status(404).json({ error: "Specified coach not found or user is not a coach" });
        return;
      }
    }

    const gymClass = await prisma.gymClass.create({
      data: parseResult.data,
      include: {
        coach: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.status(201).json({ data: { class: gymClass } });
  } catch (error) {
    console.error("createClass error:", error);
    res.status(500).json({ error: "Internal server error creating gym class" });
  }
}

export async function updateClass(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = updateClassSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    if (parseResult.data.coachId !== undefined && parseResult.data.coachId !== null) {
      const coach = await prisma.user.findFirst({ where: { id: parseResult.data.coachId, role: Role.COACH } });
      if (!coach) {
        res.status(404).json({ error: "Specified coach not found or user is not a coach" });
        return;
      }
    }

    const gymClass = await prisma.gymClass.update({
      where: { id: req.params.id },
      data: parseResult.data,
      include: {
        coach: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.status(200).json({ data: { class: gymClass } });
  } catch (error) {
    console.error("updateClass error:", error);
    res.status(500).json({ error: "Internal server error updating gym class" });
  }
}

export async function deleteClass(req: Request, res: Response): Promise<void> {
  try {
    await prisma.gymClass.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ data: { message: "Gym class deleted successfully" } });
  } catch (error) {
    console.error("deleteClass error:", error);
    res.status(500).json({ error: "Internal server error deleting gym class" });
  }
}

export async function assignCoachToClass(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = assignCoachSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const { coachId } = parseResult.data;

    if (coachId) {
      const coach = await prisma.user.findFirst({ where: { id: coachId, role: Role.COACH } });
      if (!coach) {
        res.status(404).json({ error: "Specified coach not found or user is not a coach" });
        return;
      }
    }

    const gymClass = await prisma.gymClass.update({
      where: { id: req.params.id },
      data: { coachId },
      include: {
        coach: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.status(200).json({ data: { class: gymClass } });
  } catch (error) {
    console.error("assignCoachToClass error:", error);
    res.status(500).json({ error: "Internal server error assigning coach to class" });
  }
}

export async function createScheduleByAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { classId } = req.params;
    const gymClass = await prisma.gymClass.findUnique({ where: { id: classId } });

    if (!gymClass) {
      res.status(404).json({ error: "Gym class not found" });
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
    console.error("createScheduleByAdmin error:", error);
    res.status(500).json({ error: "Internal server error creating schedule slot" });
  }
}

export async function updateScheduleByAdmin(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = updateScheduleSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const schedule = await prisma.classSchedule.update({
      where: { id: req.params.scheduleId },
      data: parseResult.data,
    });

    res.status(200).json({ data: { schedule } });
  } catch (error) {
    console.error("updateScheduleByAdmin error:", error);
    res.status(500).json({ error: "Internal server error updating schedule slot" });
  }
}

export async function deleteScheduleByAdmin(req: Request, res: Response): Promise<void> {
  try {
    await prisma.classSchedule.delete({
      where: { id: req.params.scheduleId },
    });

    res.status(200).json({ data: { message: "Schedule slot deleted successfully" } });
  } catch (error) {
    console.error("deleteScheduleByAdmin error:", error);
    res.status(500).json({ error: "Internal server error deleting schedule slot" });
  }
}
