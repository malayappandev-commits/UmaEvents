"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatBytes, formatDateShort } from "@/lib/utils";
import type { Media } from "@/types";

export function EmployeeMediaGrid({
  media,
  canDeleteId,
}: {
  media: Media[];
  canDeleteId?: string;
}) {
  const router = useRouter();
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const next: Record<string, string> = {};
      for (const m of media) {
        const path = m.thumbnail_url || m.storage_path;
        const { data } = await supabase.storage.from("project-media").createSignedUrl(path, 3600);
        if (data?.signedUrl) next[m.id] = data.signedUrl;
      }
      setUrls(next);
    })();
  }, [media]);

  async function remove(m: Media) {
    if (canDeleteId && m.uploaded_by !== canDeleteId) return;
    if (!confirm("Remove this file?")) return;
    const supabase = createClient();
    await supabase.storage.from("project-media").remove([m.storage_path, m.thumbnail_url].filter(Boolean) as string[]);
    await supabase.from("media").delete().eq("id", m.id);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {media.map((m) => (
        <article key={m.id} className="overflow-hidden border border-white/10">
          <div className="aspect-square bg-black/40">
            {urls[m.id] && m.type === "PHOTO" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urls[m.id]} alt={m.filename} className="h-full w-full object-cover" />
            ) : m.type === "VIDEO" && urls[m.id] ? (
              <video src={urls[m.id]} className="h-full w-full object-cover" muted />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px]">{m.type}</div>
            )}
          </div>
          <div className="space-y-1 p-2 text-xs">
            <p className="truncate">{m.filename}</p>
            <p className="text-ivory/50">
              {formatBytes(m.size_bytes)} · {m.status} · {formatDateShort(m.created_at)}
            </p>
            {!canDeleteId || m.uploaded_by === canDeleteId ? (
              <button type="button" className="text-red-300" onClick={() => void remove(m)}>
                Delete
              </button>
            ) : null}
          </div>
        </article>
      ))}
      {!media.length ? <p className="col-span-full text-ivory/50">No media yet. Upload above.</p> : null}
    </div>
  );
}
