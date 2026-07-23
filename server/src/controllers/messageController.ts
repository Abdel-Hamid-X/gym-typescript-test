import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { createMessageSchema } from "../schemas/messages.js";

export async function createContactMessage(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const message = await prisma.contactMessage.create({
      data: parseResult.data,
    });

    res.status(201).json({
      data: {
        message,
        note: "Thank you for contacting us! We will get back to you shortly.",
      },
    });
  } catch (error) {
    console.error("createContactMessage error:", error);
    res.status(500).json({ error: "Internal server error submitting message" });
  }
}
