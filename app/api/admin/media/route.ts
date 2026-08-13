import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffRole } from "@/lib/auth/roles";
import { z } from "zod";

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", user.id).single();
  if (!profile || profile.status !== "ACTIVE" || !isStaffRole(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = z.object({ ids: z.array(z.string().uuid()).min(1) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { data: rows } = await supabase.from("media").select("id, storage_path, thumbnail_url").in("id", parsed.data.ids);
  const admin = createAdminClient();
  const paths = (rows ?? []).flatMap((r) => [r.storage_path, r.thumbnail_url].filter(Boolean) as string[]);
  if (paths.length) {
    await admin.storage.from("project-media").remove(paths);
  }
  const { error } = await supabase.from("media").delete().in("id", parsed.data.ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
