import { z } from "zod";

export const testimonialSchema = z.object({
  quote: z.string().trim().min(4).max(2000),
  author_name: z.string().trim().max(120).optional().default(""),
  author_role: z.string().trim().max(120).optional().default(""),
  display_order: z.coerce.number().int().optional().default(0),
  published: z.boolean().optional().default(false),
});

export const siteRatingSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(40),
  caption: z.string().trim().max(160).optional().default(""),
  display_order: z.coerce.number().int().optional().default(0),
  published: z.boolean().optional().default(false),
});

export const whyChooseUsSchema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().max(2000).optional().default(""),
  display_order: z.coerce.number().int().optional().default(0),
  published: z.boolean().optional().default(false),
});

export const serviceRatingSchema = z.object({
  service_id: z.string().uuid(),
  customer_name: z.string().trim().max(120).optional().default(""),
  rating: z.coerce.number().int().min(1).max(5),
  review: z.string().trim().max(4000).optional().default(""),
  published: z.boolean().optional().default(false),
});

export const galleryMetaSchema = z.object({
  title: z.string().trim().max(160).optional().default(""),
  caption: z.string().trim().max(400).optional().default(""),
  event_date: z.string().optional().nullable(),
  display_order: z.coerce.number().int().optional().default(0),
  published: z.boolean().optional().default(false),
});
