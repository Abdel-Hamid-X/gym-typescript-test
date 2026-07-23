import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters").trim().optional(),
  phoneNumber: z.string().max(50).nullable().optional(),
  personalGoals: z.string().max(1000).nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters").trim().optional(),
  role: z.enum(["MEMBER", "COACH", "ADMIN"]).optional(),
  phoneNumber: z.string().max(50).nullable().optional(),
  personalGoals: z.string().max(1000).nullable().optional(),
});

export const adminUserQuerySchema = z.object({
  role: z.enum(["MEMBER", "COACH", "ADMIN"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type AdminUserQueryInput = z.infer<typeof adminUserQuerySchema>;
