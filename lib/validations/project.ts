import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  event_type: z.string().trim().max(80).optional().default(""),
  location: z.string().trim().max(160).optional().default(""),
  event_date: z.string().optional().nullable(),
  description: z.string().max(20000).optional().default(""),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  client_name: z.string().trim().max(160).optional().nullable(),
  show_client_publicly: z.boolean().optional().default(false),
  photographer: z.string().trim().max(160).optional().nullable(),
  videographer: z.string().trim().max(160).optional().nullable(),
  guest_count: z.coerce.number().int().positive().optional().nullable(),
  event_highlights: z.array(z.string().trim().min(1).max(200)).optional().default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;
