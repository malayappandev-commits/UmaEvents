import type { UserRole } from "@/types";
import { STAFF_ROLES } from "@/lib/constants";

export function isStaffRole(role: UserRole | string | null | undefined) {
  return STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number]);
}

export function portalHome(role: UserRole | string | null | undefined) {
  if (role === "EMPLOYEE") return "/employee";
  if (role === "ADMIN" || role === "OWNER") return "/admin";
  return "/login";
}
