import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { updateMessageStatusSchema } from "../schemas/messages.js";
import { MessageStatus, Prisma } from "@prisma/client";

export async function getContactMessages(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.query;
    const where: Prisma.ContactMessageWhereInput = {};

    if (status && Object.values(MessageStatus).includes(status as MessageStatus)) {
      where.status = status as MessageStatus;
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ data: { messages } });
  } catch (error) {
    console.error("getContactMessages error:", error);
    res.status(500).json({ error: "Internal server error retrieving contact messages" });
  }
}

export async function getMessageById(req: Request, res: Response): Promise<void> {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }

    res.status(200).json({ data: { message } });
  } catch (error) {
    console.error("getMessageById error:", error);
    res.status(500).json({ error: "Internal server error retrieving message details" });
  }
}

export async function updateMessageStatus(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = updateMessageStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed", details: parseResult.error.flatten().fieldErrors });
      return;
    }

    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { status: parseResult.data.status },
    });

    res.status(200).json({ data: { message } });
  } catch (error) {
    console.error("updateMessageStatus error:", error);
    res.status(500).json({ error: "Internal server error updating message status" });
  }
}

export async function deleteContactMessage(req: Request, res: Response): Promise<void> {
  try {
    await prisma.contactMessage.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ data: { message: "Contact message deleted successfully" } });
  } catch (error) {
    console.error("deleteContactMessage error:", error);
    res.status(500).json({ error: "Internal server error deleting contact message" });
  }
}
