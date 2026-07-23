import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

export async function getClasses(req: Request, res: Response): Promise<void> {
  try {
    const classes = await prisma.gymClass.findMany({
      where: { active: true },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            coachProfile: true,
          },
        },
        schedules: {
          where: { active: true },
          orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({ data: { classes } });
  } catch (error) {
    console.error("getClasses error:", error);
    res.status(500).json({ error: "Internal server error retrieving gym classes" });
  }
}

export async function getClassById(req: Request, res: Response): Promise<void> {
  try {
    const gymClass = await prisma.gymClass.findUnique({
      where: { id: req.params.id },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            coachProfile: true,
          },
        },
        schedules: {
          where: { active: true },
          orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!gymClass || !gymClass.active) {
      res.status(404).json({ error: "Gym class not found" });
      return;
    }

    res.status(200).json({ data: { class: gymClass } });
  } catch (error) {
    console.error("getClassById error:", error);
    res.status(500).json({ error: "Internal server error retrieving class details" });
  }
}
