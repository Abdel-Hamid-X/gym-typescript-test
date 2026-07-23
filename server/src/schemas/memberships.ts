import { z } from "zod";

export const assignMembershipSchema = z
  .object({
    planId: z.string().min(1, "Plan ID is required"),
    startsAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => data.expiresAt > data.startsAt, {
    message: "Expiration date must be after start date",
    path: ["expiresAt"],
  });

export const extendMembershipSchema = z.object({
  expiresAt: z.coerce.date(),
  notes: z.string().max(1000).nullable().optional(),
});

export type AssignMembershipInput = z.infer<typeof assignMembershipSchema>;
export type ExtendMembershipInput = z.infer<typeof extendMembershipSchema>;
