import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  short_description: z.string().trim().max(600).optional().default(""),
  long_description: z.string().trim().max(8000).optional().default(""),
  offerings: z.array(z.string().trim().min(1).max(200)).optional().default([]),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  category: z.string().trim().max(80).optional().default(""),
  display_order: z.coerce.number().int().optional().default(0),
  published: z.boolean().optional().default(false),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
