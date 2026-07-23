import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  updateStatusSchema,
} from "../schemas/equipment.js";

export async function createEquipment(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createEquipmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const equipment = await prisma.equipment.create({
      data: parseResult.data,
    });

    res.status(201).json({ data: { equipment } });
  } catch (error) {
    console.error("createEquipment error:", error);
    res.status(500).json({ error: "Internal server error creating equipment item" });
  }
}

export async function updateEquipment(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = updateEquipmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const equipment = await prisma.equipment.update({
      where: { id: req.params.id },
      data: parseResult.data,
    });

    res.status(200).json({ data: { equipment } });
  } catch (error) {
    console.error("updateEquipment error:", error);
    res.status(500).json({ error: "Internal server error updating equipment item" });
  }
}

export async function deleteEquipment(req: Request, res: Response): Promise<void> {
  try {
    await prisma.equipment.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ data: { message: "Equipment item deleted successfully" } });
  } catch (error) {
    console.error("deleteEquipment error:", error);
    res.status(500).json({ error: "Internal server error deleting equipment item" });
  }
}

export async function updateEquipmentStatus(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = updateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const equipment = await prisma.equipment.update({
      where: { id: req.params.id },
      data: { status: parseResult.data.status },
    });

    res.status(200).json({ data: { equipment } });
  } catch (error) {
    console.error("updateEquipmentStatus error:", error);
    res.status(500).json({ error: "Internal server error updating equipment status" });
  }
}

export async function uploadImage(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: "No image file provided or invalid file format" });
    return;
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    data: {
      imageUrl,
      filename: req.file.filename,
    },
  });
}
