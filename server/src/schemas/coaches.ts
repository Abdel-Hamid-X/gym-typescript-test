import { z } from "zod";

export const createCoachSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  specialization: z.string().min(2, "Specialization is required").max(100).trim(),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(2000).trim(),
  avatarUrl: z.string().nullable().optional(),
});

export const updateCoachProfileSchema = z.object({
  specialization: z.string().min(2).max(100).trim().optional(),
  bio: z.string().min(10).max(2000).trim().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export type CreateCoachInput = z.infer<typeof createCoachSchema>;
export type UpdateCoachProfileInput = z.infer<typeof updateCoachProfileSchema>;
