import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(2, "Plan name is required").max(100).trim(),
  price: z.number().int().min(0, "Price cannot be negative"),
  description: z.string().max(1000),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  durationDays: z.number().int().min(1).default(30),
  displayOrder: z.number().int().default(0),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
