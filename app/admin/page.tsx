import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/guards";
import { formatDateShort } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const { supabase } = await requireStaff();

  const [projects, published, featured, media, employees, enquiries, recentMedia, recentEnquiries, activity] =
    await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("featured", true),
      supabase.from("media").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "EMPLOYEE"),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "NEW"),
      supabase
        .from("media")
        .select("id, filename, type, status, created_at, project_id")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("enquiries")
        .select("id, name, event_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("activity")
        .select("id, action, entity_type, created_at, metadata")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const cards = [
    { label: "Total events", value: projects.count ?? 0, href: "/admin/projects" },
    { label: "Published", value: published.count ?? 0, href: "/admin/projects" },
    { label: "Featured", value: featured.count ?? 0, href: "/admin/projects" },
    { label: "Media", value: media.count ?? 0, href: "/admin/media" },
    { label: "Employees", value: employees.count ?? 0, href: "/admin/employees" },
    { label: "New enquiries", value: enquiries.count ?? 0, href: "/admin/enquiries" },
  ];

  return (
    <div>
      <h1 className="font-serif text-4xl">Admin portal</h1>
      <p className="mt-2 text-sm text-admin-muted">Live figures from Uma Events — nothing here is hardcoded.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="border border-admin-line bg-admin-panel p-5 hover:border-gold/40">
            <p className="text-[11px] tracking-[0.2em] text-admin-muted uppercase">{c.label}</p>
            <p className="mt-3 font-serif text-4xl">{c.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section>
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-gold">Recent uploads</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(recentMedia.data ?? []).map((m) => (
              <li key={m.id} className="flex justify-between gap-3 border-b border-admin-line pb-2">
                <span className="truncate">{m.filename}</span>
                <span className="text-admin-muted">{m.status}</span>
              </li>
            ))}
            {!recentMedia.data?.length ? <li className="text-admin-muted">No uploads yet.</li> : null}
          </ul>
        </section>
        <section>
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-gold">Recent enquiries</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(recentEnquiries.data ?? []).map((e) => (
              <li key={e.id}>
                <Link href="/admin/enquiries" className="flex justify-between gap-3 border-b border-admin-line pb-2 hover:text-gold">
                  <span>{e.name}</span>
                  <span className="text-admin-muted">{e.status}</span>
                </Link>
              </li>
            ))}
            {!recentEnquiries.data?.length ? <li className="text-admin-muted">No enquiries yet.</li> : null}
          </ul>
        </section>
        <section>
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-gold">Activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(activity.data ?? []).map((a) => (
              <li key={a.id} className="border-b border-admin-line pb-2">
                <p>{a.action.replaceAll("_", " ")}</p>
                <p className="text-xs text-admin-muted">{formatDateShort(a.created_at)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
