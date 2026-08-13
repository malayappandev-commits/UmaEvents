"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MediaUploader } from "@/components/media/uploader";
import { MEDIA_PAGE_SIZE } from "@/lib/constants";
import { formatBytes, formatDateShort } from "@/lib/utils";
import type { Media } from "@/types";

export function MediaLibrary({
  projects,
  initialProjectId,
}: {
  projects: { id: string; title: string }[];
  initialProjectId?: string;
}) {
  const [projectId, setProjectId] = useState(initialProjectId || projects[0]?.id || "");
  const [type, setType] = useState<"ALL" | "PHOTO" | "VIDEO">("ALL");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"created_at" | "filename" | "sort_order">("created_at");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<Media | null>(null);
  const qc = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  const list = useQuery({
    queryKey: ["admin-media", projectId, type, q, sort, page],
    enabled: Boolean(projectId),
    queryFn: async () => {
      let query = supabase
        .from("media")
        .select("*", { count: "exact" })
        .eq("project_id", projectId)
        .order(sort, { ascending: sort === "filename" || sort === "sort_order" })
        .range(page * MEDIA_PAGE_SIZE, page * MEDIA_PAGE_SIZE + MEDIA_PAGE_SIZE - 1);
      if (type !== "ALL") query = query.eq("type", type);
      if (q) query = query.ilike("filename", `%${q}%`);
      const { data, error, count } = await query;
      if (error) throw error;
      const rows = (data ?? []) as Media[];
      const signed: Record<string, string> = {};
      for (const row of rows) {
        const path = row.thumbnail_url || row.storage_path;
        const { data: s } = await supabase.storage.from("project-media").createSignedUrl(path, 3600);
        if (s?.signedUrl) signed[row.id] = s.signedUrl;
      }
      return { rows, count: count ?? 0, signed };
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      setSelected([]);
      void qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  async function setCover(id: string) {
    if (!projectId) return;
    await supabase.from("media").update({ is_cover: false }).eq("project_id", projectId);
    await supabase.from("media").update({ is_cover: true }).eq("id", id);
    await supabase.from("projects").update({ cover_media_id: id }).eq("id", projectId);
    void qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  const pages = Math.ceil((list.data?.count ?? 0) / MEDIA_PAGE_SIZE);

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-3">
        <select
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            setPage(0);
          }}
          className="border border-white/15 bg-transparent px-3 py-2 text-sm"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id} className="text-black">
              {p.title}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="border border-white/15 bg-transparent px-3 py-2 text-sm">
          <option className="text-black">ALL</option>
          <option className="text-black">PHOTO</option>
          <option className="text-black">VIDEO</option>
        </select>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Search filename"
          className="border border-white/15 bg-transparent px-3 py-2 text-sm"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="border border-white/15 bg-transparent px-3 py-2 text-sm">
          <option value="created_at" className="text-black">
            Newest
          </option>
          <option value="filename" className="text-black">
            Filename
          </option>
          <option value="sort_order" className="text-black">
            Order
          </option>
        </select>
      </div>

      {projectId ? <MediaUploader projectId={projectId} onComplete={() => void qc.invalidateQueries({ queryKey: ["admin-media"] })} /> : null}

      {selected.length ? (
        <button
          type="button"
          onClick={() => bulkDelete.mutate(selected)}
          className="border border-red-400/40 px-4 py-2 text-xs uppercase text-red-300"
        >
          Delete {selected.length} selected
        </button>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {(list.data?.rows ?? []).map((m) => (
          <article key={m.id} className="overflow-hidden border border-admin-line bg-admin-panel">
            <button type="button" className="relative block aspect-square w-full" onClick={() => setPreview(m)}>
              {list.data?.signed[m.id] && m.type === "PHOTO" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={list.data.signed[m.id]} alt={m.filename} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] tracking-widest">VIDEO</div>
              )}
            </button>
            <div className="space-y-1 p-2 text-[11px]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(m.id)}
                  onChange={(e) =>
                    setSelected((prev) => (e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)))
                  }
                />
                <span className="truncate">{m.filename}</span>
              </label>
              <p className="text-admin-muted">
                {formatBytes(m.size_bytes)} · {m.status}
              </p>
              <p className="text-admin-muted">{formatDateShort(m.created_at)}</p>
              <button type="button" className="text-gold" onClick={() => void setCover(m.id)}>
                {m.is_cover ? "Cover" : "Set cover"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {pages > 1 ? (
        <div className="flex gap-2">
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="border border-white/15 px-3 py-1 text-sm">
            Prev
          </button>
          <span className="text-sm text-admin-muted">
            {page + 1} / {pages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="border border-white/15 px-3 py-1 text-sm"
          >
            Next
          </button>
        </div>
      ) : null}

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6" onClick={() => setPreview(null)}>
          <p className="absolute top-6 left-6 text-sm">{preview.filename}</p>
          {preview.type === "VIDEO" ? (
            <video
              controls
              className="max-h-[85vh] max-w-full"
              src={list.data?.signed[preview.id]}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={list.data?.signed[preview.id]} alt={preview.filename} className="max-h-[85vh] max-w-full object-contain" />
          )}
        </div>
      ) : null}
    </div>
  );
}
