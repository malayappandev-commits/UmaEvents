"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ALLOWED_MEDIA_TYPES } from "@/lib/constants";
import { buildStoragePath, detectMediaType } from "@/lib/storage/paths";
import { resumableUpload } from "@/lib/storage/upload";
import { formatBytes } from "@/lib/utils";

type Item = {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "queued" | "uploading" | "done" | "error" | "cancelled";
  error?: string;
  controller: AbortController;
};

async function makeImageThumb(file: File): Promise<Blob | null> {
  if (!file.type.startsWith("image/")) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const max = 960;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.72));
  } catch {
    return null;
  }
}

export function MediaUploader({
  projectId,
  onComplete,
}: {
  projectId: string;
  onComplete?: () => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Item[]>([]);
  const pumping = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const patch = (id: string, partial: Partial<Item>) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
  };

  const pump = useCallback(async () => {
    if (pumping.current) return;
    pumping.current = true;
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      pumping.current = false;
      return;
    }

    const takeNext = () => itemsRef.current.find((i) => i.status === "queued");

    const runOne = async (item: Item) => {
      const type = detectMediaType(item.file.type);
      if (!type) throw new Error("Unsupported file");
      const path = buildStoragePath(projectId, type, item.file.name);
      const { data: row, error: insertError } = await supabase
        .from("media")
        .insert({
          project_id: projectId,
          uploaded_by: session.user.id,
          type,
          storage_path: path,
          filename: item.file.name,
          mime_type: item.file.type,
          size_bytes: item.file.size,
          status: "UPLOADING",
        })
        .select("id")
        .single();
      if (insertError || !row) throw insertError || new Error("Could not create media record");

      try {
        await resumableUpload({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          accessToken: session.access_token,
          bucket: "project-media",
          objectName: path,
          file: item.file,
          contentType: item.file.type,
          signal: item.controller.signal,
          onProgress(bytesUploaded, bytesTotal) {
            patch(item.id, {
              progress: Math.round((bytesUploaded / bytesTotal) * 100),
              status: "uploading",
            });
          },
        });

        let thumbnailPath: string | null = null;
        const thumb = await makeImageThumb(item.file);
        if (thumb) {
          thumbnailPath = `${projectId}/thumbs/${row.id}.jpg`;
          await supabase.storage.from("project-media").upload(thumbnailPath, thumb, {
            contentType: "image/jpeg",
            upsert: true,
          });
        }

        const { error: updateError } = await supabase
          .from("media")
          .update({
            status: "READY",
            thumbnail_url: thumbnailPath,
            public_url: path,
          })
          .eq("id", row.id);
        if (updateError) throw updateError;
        patch(item.id, { progress: 100, status: "done" });
      } catch (e) {
        await supabase.from("media").update({ status: "FAILED" }).eq("id", row.id);
        throw e;
      }
    };

    const worker = async () => {
      while (true) {
        const next = takeNext();
        if (!next) break;
        patch(next.id, { status: "uploading" });
        await new Promise((r) => setTimeout(r, 0));
        const current = itemsRef.current.find((i) => i.id === next.id);
        if (!current || current.status === "cancelled") continue;
        try {
          await runOne(current);
        } catch (e) {
          if (current.controller.signal.aborted) {
            patch(current.id, { status: "cancelled" });
          } else {
            patch(current.id, {
              status: "error",
              error: e instanceof Error ? e.message : "Upload failed",
            });
          }
        }
      }
    };

    await Promise.all([worker(), worker(), worker()]);
    pumping.current = false;
    if (itemsRef.current.some((i) => i.status === "queued")) {
      void pump();
      return;
    }
    onComplete?.();
  }, [onComplete, projectId]);

  const addAndStart = (files: FileList | File[]) => {
    const next: Item[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_MEDIA_TYPES.includes(file.type)) continue;
      next.push({
        id: crypto.randomUUID(),
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
        progress: 0,
        status: "queued",
        controller: new AbortController(),
      });
    }
    setItems((prev) => [...prev, ...next]);
    setTimeout(() => void pump(), 30);
  };

  const totals = items.filter((i) => i.status !== "cancelled");
  const loaded = totals.reduce(
    (s, i) => s + (i.status === "done" ? i.file.size : (i.progress / 100) * i.file.size),
    0,
  );
  const totalBytes = totals.reduce((s, i) => s + i.file.size, 0);
  const pct = totalBytes ? Math.round((loaded / totalBytes) * 100) : 0;
  const done = totals.filter((i) => i.status === "done").length;

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addAndStart(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border border-dashed px-6 py-12 text-center transition ${
          drag ? "border-gold bg-gold/10" : "border-white/20 bg-white/5 hover:border-gold/50"
        }`}
      >
        <p className="font-serif text-2xl">Drop photographs and videos</p>
        <p className="mt-2 text-sm opacity-70">Select multiple files. Large videos use resumable uploads.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_MEDIA_TYPES.join(",")}
          className="hidden"
          onChange={(e) => e.target.files && addAndStart(e.target.files)}
        />
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs tracking-widest uppercase opacity-70">
            <span>
              {done}/{totals.length} complete
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
          </div>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 rounded-xl bg-white/5 p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/40">
                  {item.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px]">VIDEO</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm">{item.file.name}</p>
                    <p className="text-xs opacity-60">{formatBytes(item.file.size)}</p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full ${item.status === "error" ? "bg-red-400" : "bg-gold"}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs opacity-70">
                    <span>
                      {item.status === "done"
                        ? "Uploaded"
                        : item.status === "error"
                          ? item.error || "Failed"
                          : item.status === "cancelled"
                            ? "Cancelled"
                            : item.status === "uploading"
                              ? `Uploading ${item.progress}%`
                              : "Waiting"}
                    </span>
                    <span className="flex gap-2">
                      {item.status === "uploading" || item.status === "queued" ? (
                        <button type="button" onClick={() => item.controller.abort()} className="hover:text-gold">
                          Cancel
                        </button>
                      ) : null}
                      {item.status === "error" ? (
                        <button
                          type="button"
                          onClick={() => {
                            patch(item.id, {
                              status: "queued",
                              progress: 0,
                              error: undefined,
                              controller: new AbortController(),
                            });
                            setTimeout(() => void pump(), 30);
                          }}
                          className="hover:text-gold"
                        >
                          Retry
                        </button>
                      ) : null}
                      {item.status === "queued" ? (
                        <button
                          type="button"
                          onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
                          className="hover:text-gold"
                        >
                          Remove
                        </button>
                      ) : null}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
