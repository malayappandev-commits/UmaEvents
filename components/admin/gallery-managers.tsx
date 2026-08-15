"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { detectMediaType } from "@/lib/storage/paths";
import type { GalleryMedia, Service, ServiceMedia } from "@/types";

const field = "w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold";

export function MainGalleryManager({ items }: { items: GalleryMedia[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function upload(formData: FormData) {
    setError("");
    const file = formData.get("file") as File | null;
    if (!file || !file.size) {
      setError("Choose a file");
      return;
    }
    const type = detectMediaType(file.type);
    if (!type) {
      setError("Unsupported file type");
      return;
    }
    const supabase = createClient();
    const path = `gallery/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const { error: up } = await supabase.storage.from("public-assets").upload(path, file, {
      upsert: false,
      contentType: file.type,
    });
    if (up) {
      setError(up.message);
      return;
    }
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    const { error: ins } = await supabase.from("gallery_media").insert({
      title: String(formData.get("title") || ""),
      caption: String(formData.get("caption") || ""),
      event_date: String(formData.get("event_date") || "") || null,
      display_order: Number(formData.get("display_order") || 0),
      published: formData.get("published") === "on",
      type,
      storage_path: path,
      public_url: data.publicUrl,
      filename: file.name,
      mime_type: file.type,
    });
    if (ins) setError(ins.message);
    else router.refresh();
  }

  async function toggle(id: string, published: boolean) {
    const supabase = createClient();
    await supabase.from("gallery_media").update({ published: !published }).eq("id", id);
    router.refresh();
  }

  async function remove(item: GalleryMedia) {
    if (!confirm("Delete this gallery item?")) return;
    const supabase = createClient();
    await supabase.from("gallery_media").delete().eq("id", item.id);
    await supabase.storage.from("public-assets").remove([item.storage_path]);
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <form action={upload} className="space-y-3">
        <input name="title" placeholder="Title" className={field} />
        <input name="caption" placeholder="Caption" className={field} />
        <input name="event_date" type="date" className={field} />
        <input name="display_order" type="number" defaultValue={0} className={field} />
        <input name="file" type="file" accept="image/*,video/*" required className="text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" /> Published
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button type="submit" className="bg-gold px-4 py-2 text-[11px] tracking-[0.2em] text-ink uppercase">
          Upload
        </button>
      </form>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="border border-admin-line p-3 text-sm">
            {item.public_url && item.type === "PHOTO" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.public_url} alt={item.title} className="mb-2 aspect-square w-full object-cover" />
            ) : null}
            <p>{item.title || item.filename}</p>
            <p className="text-xs text-admin-muted">{item.published ? "Published" : "Hidden"}</p>
            <div className="mt-2 flex gap-3 text-xs">
              <button type="button" onClick={() => void toggle(item.id, item.published)}>
                {item.published ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="text-red-300" onClick={() => void remove(item)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {!items.length ? <li className="text-admin-muted">No gallery media yet.</li> : null}
      </ul>
    </div>
  );
}

export function ServicesGalleryManager({
  services,
  media,
}: {
  services: Pick<Service, "id" | "title" | "slug">[];
  media: ServiceMedia[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id || "");

  async function upload(formData: FormData) {
    setError("");
    const file = formData.get("file") as File | null;
    const sid = String(formData.get("service_id") || serviceId);
    if (!file || !file.size || !sid) {
      setError("Choose a service and a file");
      return;
    }
    const type = detectMediaType(file.type);
    if (!type) {
      setError("Unsupported file type");
      return;
    }
    const supabase = createClient();
    const path = `service-gallery/${sid}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const { error: up } = await supabase.storage.from("public-assets").upload(path, file, {
      contentType: file.type,
    });
    if (up) {
      setError(up.message);
      return;
    }
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    const { error: ins } = await supabase.from("service_media").insert({
      service_id: sid,
      type,
      storage_path: path,
      public_url: data.publicUrl,
      filename: file.name,
      mime_type: file.type,
      sort_order: Number(formData.get("sort_order") || 0),
      published: formData.get("published") === "on",
    });
    if (ins) setError(ins.message);
    else router.refresh();
  }

  async function remove(item: ServiceMedia) {
    if (!confirm("Delete this media item?")) return;
    const supabase = createClient();
    await supabase.from("service_media").delete().eq("id", item.id);
    await supabase.storage.from("public-assets").remove([item.storage_path]);
    router.refresh();
  }

  const grouped = services.map((s) => ({
    ...s,
    items: media.filter((m) => m.service_id === s.id),
  }));

  return (
    <div className="mt-8 space-y-10">
      <form action={upload} className="max-w-xl space-y-3">
        <select
          name="service_id"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className={field}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id} className="text-black">
              {s.title} ({s.slug})
            </option>
          ))}
        </select>
        <input name="sort_order" type="number" defaultValue={0} className={field} />
        <input name="file" type="file" accept="image/*,video/*" required className="text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked /> Published
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button type="submit" className="bg-gold px-4 py-2 text-[11px] tracking-[0.2em] text-ink uppercase">
          Upload to service
        </button>
      </form>
      {grouped.map((s) => (
        <section key={s.id}>
          <h2 className="font-serif text-2xl">{s.title}</h2>
          {s.items.length ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-4">
              {s.items.map((item) => (
                <li key={item.id} className="border border-admin-line p-2 text-xs">
                  {item.public_url && item.type === "PHOTO" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.public_url} alt="" className="mb-2 aspect-square w-full object-cover" />
                  ) : (
                    <p>{item.filename}</p>
                  )}
                  <button type="button" className="text-red-300" onClick={() => void remove(item)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-admin-muted">No media for this service.</p>
          )}
        </section>
      ))}
      {!services.length ? <p className="text-admin-muted">Create a service first.</p> : null}
    </div>
  );
}
