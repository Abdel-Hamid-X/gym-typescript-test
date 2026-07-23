import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

export async function getPlans(req: Request, res: Response): Promise<void> {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    });

    res.status(200).json({ data: { plans } });
  } catch (error) {
    console.error("getPlans error:", error);
    res.status(500).json({ error: "Internal server error retrieving plans" });
  }
}

export async function getPlanById(req: Request, res: Response): Promise<void> {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: req.params.id },
    });

    if (!plan || !plan.active) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    res.status(200).json({ data: { plan } });
  } catch (error) {
    console.error("getPlanById error:", error);
    res.status(500).json({ error: "Internal server error retrieving plan details" });
  }
}
