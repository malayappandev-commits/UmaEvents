"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDateShort, isPublicLiveUrl } from "@/lib/utils";
import type { Project } from "@/types";

export function EventFlagsBoard({
  projects,
  mode,
}: {
  projects: Project[];
  mode: "featured" | "milestones";
}) {
  const router = useRouter();

  async function patch(id: string, data: Record<string, unknown>) {
    const supabase = createClient();
    await supabase.from("projects").update(data).eq("id", id);
    router.refresh();
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-[11px] tracking-[0.16em] text-admin-muted uppercase">
          <tr>
            <th className="pb-3">Title</th>
            <th className="pb-3">Published</th>
            {mode === "featured" ? <th className="pb-3">Featured</th> : <th className="pb-3">Milestone</th>}
            {mode === "featured" ? <th className="pb-3">Live URL</th> : <th className="pb-3">Order / description</th>}
            <th className="pb-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-t border-admin-line align-top">
              <td className="py-3">
                <Link href={`/admin/projects/${p.id}`} className="hover:text-gold">
                  {p.title}
                </Link>
                <p className="text-xs text-admin-muted">{p.event_type}</p>
              </td>
              <td className="py-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={p.published}
                    onChange={(e) => void patch(p.id, { published: e.target.checked })}
                  />
                  Live on site
                </label>
              </td>
              {mode === "featured" ? (
                <>
                  <td className="py-3">
                    <input
                      type="checkbox"
                      defaultChecked={p.featured}
                      onChange={(e) => void patch(p.id, { featured: e.target.checked })}
                    />
                  </td>
                  <td className="py-3">
                    <input
                      defaultValue={p.live_url ?? ""}
                      placeholder="https://…"
                      className="w-56 border border-white/15 bg-transparent px-2 py-1 text-xs"
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        void patch(p.id, { live_url: isPublicLiveUrl(value) ? value : null });
                      }}
                    />
                    <p className="mt-1 text-[10px] text-admin-muted">Watch Live shows only for a valid http(s) URL.</p>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-3">
                    <input
                      type="checkbox"
                      defaultChecked={p.is_milestone}
                      onChange={(e) => void patch(p.id, { is_milestone: e.target.checked })}
                    />
                  </td>
                  <td className="py-3">
                    <input
                      type="number"
                      defaultValue={p.milestone_order ?? 0}
                      className="mb-2 w-24 border border-white/15 bg-transparent px-2 py-1 text-xs"
                      onBlur={(e) => void patch(p.id, { milestone_order: Number(e.target.value || 0) })}
                    />
                    <textarea
                      defaultValue={p.milestone_description ?? ""}
                      placeholder="Milestone description"
                      className="w-full border border-white/15 bg-transparent px-2 py-1 text-xs"
                      rows={3}
                      onBlur={(e) => void patch(p.id, { milestone_description: e.target.value })}
                    />
                  </td>
                </>
              )}
              <td className="py-3 text-admin-muted">{formatDateShort(p.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!projects.length ? <p className="mt-8 text-admin-muted">No events yet. Create one first.</p> : null}
      <Link href="/admin/projects/new" className="mt-6 inline-block text-[11px] uppercase text-gold">
        Create event →
      </Link>
    </div>
  );
}
