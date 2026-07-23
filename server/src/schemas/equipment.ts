import { z } from "zod";
import { EquipmentType, EquipmentStatus } from "@prisma/client";

export const createEquipmentSchema = z.object({
  name: z.string().min(2, "Equipment name must be at least 2 characters").max(100).trim(),
  type: z.nativeEnum(EquipmentType),
  quantity: z.number().int().min(0, "Quantity cannot be negative").default(1),
  status: z.nativeEnum(EquipmentStatus).default(EquipmentStatus.Operational),
  imageUrl: z.string().nullable().optional(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial();

export const updateStatusSchema = z.object({
  status: z.nativeEnum(EquipmentStatus),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
