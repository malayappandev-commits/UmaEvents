import { z } from "zod";

export const settingsSchema = z.object({
  studio_name: z.string().trim().min(2).max(120),
  contact_email: z.string().trim().email().or(z.literal("")),
  phone: z.string().trim().max(40).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  locations: z.array(z.string().trim().min(1)).optional().default([]),
  tagline: z.string().trim().max(200).optional().default(""),
  hero_headline: z.string().trim().max(200).optional().default(""),
  hero_subheadline: z.string().trim().max(400).optional().default(""),
  hero_image_url: z.string().optional().nullable(),
  hero_video_url: z.string().optional().nullable(),
  about_intro: z.string().max(2000).optional().default(""),
  about_story: z.string().max(20000).optional().default(""),
  brand_quotation: z.string().max(500).optional().default(""),
  who_we_are: z.string().max(20000).optional().default(""),
  why_trust_us: z.string().max(20000).optional().default(""),
  founder_and_team: z.string().max(20000).optional().default(""),
  collaborations: z.string().max(20000).optional().default(""),
  instagram_url: z.string().optional().nullable(),
  facebook_url: z.string().optional().nullable(),
  youtube_url: z.string().optional().nullable(),
  seo_title: z.string().trim().max(80).optional().default(""),
  seo_description: z.string().trim().max(200).optional().default(""),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
