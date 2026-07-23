import { z } from "zod";
import { MessageStatus } from "@prisma/client";

export const createMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000).trim(),
});

export const updateMessageStatusSchema = z.object({
  status: z.nativeEnum(MessageStatus),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageStatusInput = z.infer<typeof updateMessageStatusSchema>;
