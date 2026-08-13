import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { employeeCreateSchema, employeeUpdateSchema } from "@/lib/validations/media";
import { isStaffRole } from "@/lib/auth/roles";

async function requireStaffApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .single();
  if (!profile || profile.status !== "ACTIVE" || !isStaffRole(profile.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, profile, supabase };
}

export async function POST(request: Request) {
  const auth = await requireStaffApi();
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const parsed = employeeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.role === "ADMIN" && auth.profile!.role !== "OWNER") {
    return NextResponse.json({ error: "Only the owner can create admins." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });
  if (error || !data.user) {
    return NextResponse.json({ error: error?.message || "Could not create user" }, { status: 400 });
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      role: parsed.data.role,
      status: "ACTIVE",
    })
    .eq("id", data.user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.user.id });
}

export async function PATCH(request: Request) {
  const auth = await requireStaffApi();
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const parsed = employeeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("*").eq("id", parsed.data.id).single();
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.role === "OWNER" && auth.profile!.role !== "OWNER") {
    return NextResponse.json({ error: "Cannot modify the owner." }, { status: 403 });
  }
  if (parsed.data.role === "ADMIN" && auth.profile!.role !== "OWNER") {
    return NextResponse.json({ error: "Only the owner can assign admin." }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.full_name) updates.full_name = parsed.data.full_name;
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.role) updates.role = parsed.data.role;

  const { error } = await admin.from("profiles").update(updates).eq("id", parsed.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const auth = await requireStaffApi();
  if ("error" in auth && auth.error) return auth.error;

  const schema = z.object({
    user_id: z.string().uuid(),
    project_ids: z.array(z.string().uuid()),
  });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { error: delError } = await auth.supabase!
    .from("project_members")
    .delete()
    .eq("user_id", parsed.data.user_id);
  if (delError) return NextResponse.json({ error: delError.message }, { status: 400 });

  if (parsed.data.project_ids.length) {
    const rows = parsed.data.project_ids.map((project_id) => ({
      project_id,
      user_id: parsed.data.user_id,
      assigned_by: auth.user!.id,
    }));
    const { error } = await auth.supabase!.from("project_members").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
