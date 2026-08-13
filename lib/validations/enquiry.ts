import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a phone number").max(30),
  event_type: z.string().trim().max(80).optional().default(""),
  event_date: z.string().trim().optional().nullable(),
  location: z.string().trim().max(160).optional().default(""),
  guest_count: z.coerce.number().int().positive().optional().nullable(),
  budget: z.string().trim().max(80).optional().nullable(),
  message: z.string().trim().min(10, "Tell us a little about the event").max(4000),
  project_id: z.string().uuid().optional().nullable(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
