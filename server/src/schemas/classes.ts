import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters").max(100).trim(),
  description: z.string().min(5, "Description must be at least 5 characters").max(2000).trim(),
  imageUrl: z.string().nullable().optional(),
  coachId: z.string().uuid().nullable().optional(),
});

export const updateClassSchema = createClassSchema.partial();

export const assignCoachSchema = z.object({
  coachId: z.string().uuid().nullable(),
});

export const createScheduleSchema = z.object({
  weekday: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:mm format (24h)"),
  durationMinutes: z.number().int().min(15, "Duration must be at least 15 minutes").max(300),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  active: z.boolean().default(true),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type AssignCoachInput = z.infer<typeof assignCoachSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
