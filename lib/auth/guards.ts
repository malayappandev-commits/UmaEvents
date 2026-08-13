import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaffRole } from "@/lib/auth/roles";
import type { Profile, UserRole } from "@/types";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile: profile as Profile | null };
}

export async function requireStaff() {
  const ctx = await getSessionProfile();
  if (!ctx.user || !ctx.profile || ctx.profile.status !== "ACTIVE" || !isStaffRole(ctx.profile.role)) {
    redirect("/login");
  }
  return ctx as typeof ctx & { profile: Profile };
}

export async function requireEmployeePortal() {
  const ctx = await getSessionProfile();
  if (!ctx.user || !ctx.profile || ctx.profile.status !== "ACTIVE") {
    redirect("/login");
  }
  const role = ctx.profile.role as UserRole;
  if (role !== "EMPLOYEE" && role !== "ADMIN" && role !== "OWNER") {
    redirect("/login");
  }
  return ctx as typeof ctx & { profile: Profile };
}

export async function requireOwner() {
  const ctx = await requireStaff();
  if (ctx.profile.role !== "OWNER") {
    redirect("/admin");
  }
  return ctx;
}
