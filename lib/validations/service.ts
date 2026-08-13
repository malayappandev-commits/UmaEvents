import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(120),
  short_description: z.string().trim().max(600).optional().default(""),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  category: z.string().trim().max(80).optional().default(""),
  display_order: z.coerce.number().int().optional().default(0),
  published: z.boolean().optional().default(false),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
