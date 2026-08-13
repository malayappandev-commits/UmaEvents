import { z } from "zod";
import { ALLOWED_MEDIA_TYPES } from "@/lib/constants";

export const mediaInsertSchema = z.object({
  project_id: z.string().uuid(),
  filename: z.string().min(1).max(260),
  mime_type: z
    .string()
    .refine((v) => ALLOWED_MEDIA_TYPES.includes(v), "This file type is not allowed"),
  size_bytes: z.number().int().nonnegative(),
  type: z.enum(["PHOTO", "VIDEO"]),
});

export const employeeCreateSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});

export const employeeUpdateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(120).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  role: z.enum(["ADMIN", "EMPLOYEE"]).optional(),
});
