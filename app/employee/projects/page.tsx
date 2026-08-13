import type { Metadata } from "next";
import Link from "next/link";
import { requireEmployeePortal } from "@/lib/auth/guards";
import { isStaffRole } from "@/lib/auth/roles";
import { formatDateShort } from "@/lib/utils";

export const metadata: Metadata = { title: "Assigned events" };

export default async function EmployeeProjectsPage() {
  const { supabase, profile } = await requireEmployeePortal();

  const { data: members } = isStaffRole(profile.role)
    ? { data: [] as { project_id: string; assigned_at: string }[] }
    : await supabase.from("project_members").select("project_id, assigned_at").eq("user_id", profile.id);

  const ids = isStaffRole(profile.role)
    ? (await supabase.from("projects").select("id")).data?.map((p) => p.id) ?? []
    : (members ?? []).map((m) => m.project_id);

  const assignedAt = new Map((members ?? []).map((m) => [m.project_id, m.assigned_at]));

  const { data: projects } = ids.length
    ? await supabase.from("projects").select("id, title, event_date, location").in("id", ids)
    : { data: [] };

  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: media } = await supabase.from("media").select("project_id").in("project_id", ids);
    for (const m of media ?? []) counts.set(m.project_id, (counts.get(m.project_id) || 0) + 1);
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Assigned events</h1>
      <div className="mt-8 grid gap-4">
        {(projects ?? []).map((p) => (
          <Link key={p.id} href={`/employee/projects/${p.id}`} className="border border-white/10 p-5 hover:border-gold/40">
            <p className="font-serif text-3xl">{p.title}</p>
            <p className="mt-2 text-sm text-ivory/60">
              {[p.location, formatDateShort(p.event_date)].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-3 text-xs tracking-widest uppercase text-gold">
              {counts.get(p.id) || 0} media
              {assignedAt.get(p.id) ? ` · assigned ${formatDateShort(assignedAt.get(p.id)!)}` : ""}
            </p>
          </Link>
        ))}
        {!projects?.length ? <p className="text-ivory/50">Nothing assigned.</p> : null}
      </div>
    </div>
  );
}
