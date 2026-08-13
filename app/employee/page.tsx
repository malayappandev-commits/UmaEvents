import type { Metadata } from "next";
import Link from "next/link";
import { requireEmployeePortal } from "@/lib/auth/guards";
import { formatDateShort } from "@/lib/utils";
import { isStaffRole } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Workspace" };

export default async function EmployeeHome() {
  const { supabase, profile } = await requireEmployeePortal();

  let projectIds: string[] = [];
  if (isStaffRole(profile.role)) {
    const { data } = await supabase.from("projects").select("id");
    projectIds = (data ?? []).map((p) => p.id);
  } else {
    const { data: members } = await supabase
      .from("project_members")
      .select("project_id, assigned_at")
      .eq("user_id", profile.id);
    projectIds = (members ?? []).map((m) => m.project_id);
  }

  const { data: projects } = projectIds.length
    ? await supabase
        .from("projects")
        .select("id, title, event_date, location, slug")
        .in("id", projectIds)
        .order("event_date", { ascending: true, nullsFirst: false })
    : { data: [] as { id: string; title: string; event_date: string | null; location: string; slug: string }[] };

  const { count: uploadCount } = await supabase
    .from("media")
    .select("id", { count: "exact", head: true })
    .eq("uploaded_by", profile.id);

  const { data: recent } = await supabase
    .from("media")
    .select("id, filename, status, created_at, type")
    .eq("uploaded_by", profile.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (projects ?? []).filter((p) => p.event_date && p.event_date >= today);

  return (
    <div>
      <h1 className="font-serif text-4xl">Hello{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
      <p className="mt-2 text-ivory/60">Your assigned events and uploads.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-white/10 p-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gold">Assigned events</p>
          <p className="mt-2 font-serif text-4xl">{projects?.length ?? 0}</p>
        </div>
        <div className="border border-white/10 p-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gold">Your uploads</p>
          <p className="mt-2 font-serif text-4xl">{uploadCount ?? 0}</p>
        </div>
        <div className="border border-white/10 p-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gold">Upcoming</p>
          <p className="mt-2 font-serif text-4xl">{upcoming.length}</p>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl">Events I&apos;m working on</h2>
          <Link href="/employee/projects" className="text-sm text-gold">
            All
          </Link>
        </div>
        <ul className="mt-6 divide-y divide-white/10">
          {(projects ?? []).map((p) => (
            <li key={p.id} className="py-4">
              <Link href={`/employee/projects/${p.id}`} className="flex items-center justify-between hover:text-gold">
                <span>
                  <span className="block font-serif text-2xl">{p.title}</span>
                  <span className="text-sm text-ivory/50">
                    {[p.location, formatDateShort(p.event_date)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="text-[11px] tracking-[0.2em] uppercase">Upload →</span>
              </Link>
            </li>
          ))}
          {!projects?.length ? <li className="py-6 text-ivory/50">No events assigned yet.</li> : null}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-3xl">Recent uploads</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(recent ?? []).map((m) => (
            <li key={m.id} className="flex justify-between border-b border-white/10 py-2">
              <span className="truncate">{m.filename}</span>
              <span className="text-ivory/50">{m.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
