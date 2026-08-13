import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/guards";
import { formatDateShort } from "@/lib/utils";

export const metadata: Metadata = { title: "Events" };

export default async function AdminProjectsPage() {
  const { supabase } = await requireStaff();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, slug, event_type, location, event_date, published, featured, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Events</h1>
        <Link href="/admin/projects/new" className="bg-gold px-4 py-2 text-[11px] tracking-[0.2em] text-ink uppercase">
          New event
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.16em] text-admin-muted uppercase">
            <tr>
              <th className="pb-3">Title</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {(projects ?? []).map((p) => (
              <tr key={p.id} className="border-t border-admin-line">
                <td className="py-3">
                  <Link href={`/admin/projects/${p.id}`} className="hover:text-gold">
                    {p.title}
                  </Link>
                </td>
                <td>{p.event_type}</td>
                <td>{formatDateShort(p.event_date)}</td>
                <td className="text-admin-muted">
                  {p.published ? "Published" : "Draft"}
                  {p.featured ? " · Featured" : ""}
                </td>
                <td className="text-admin-muted">{formatDateShort(p.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!projects?.length ? <p className="mt-8 text-admin-muted">No events yet.</p> : null}
      </div>
    </div>
  );
}
