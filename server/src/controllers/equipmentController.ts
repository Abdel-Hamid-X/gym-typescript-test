import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { EquipmentStatus, EquipmentType, Prisma } from "@prisma/client";

export async function getEquipment(req: Request, res: Response): Promise<void> {
  try {
    const { status, type } = req.query;

    const where: Prisma.EquipmentWhereInput = {};
    if (status && Object.values(EquipmentStatus).includes(status as EquipmentStatus)) {
      where.status = status as EquipmentStatus;
    }
    if (type && Object.values(EquipmentType).includes(type as EquipmentType)) {
      where.type = type as EquipmentType;
    }

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { name: "asc" },
    });

    res.status(200).json({ data: { equipment } });
  } catch (error) {
    console.error("getEquipment error:", error);
    res.status(500).json({ error: "Internal server error retrieving equipment" });
  }
}

export async function getEquipmentById(req: Request, res: Response): Promise<void> {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: req.params.id },
    });

    if (!equipment) {
      res.status(404).json({ error: "Equipment not found" });
      return;
    }

    res.status(200).json({ data: { equipment } });
  } catch (error) {
    console.error("getEquipmentById error:", error);
    res.status(500).json({ error: "Internal server error retrieving equipment item" });
  }
}
