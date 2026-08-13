"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { serviceSchema } from "@/lib/validations/service";
import type { Service } from "@/types";

const field = "w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold";

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Service | null>(null);

  async function save(formData: FormData, id?: string) {
    const parsed = serviceSchema.safeParse({
      title: formData.get("title"),
      short_description: formData.get("short_description"),
      image_url: String(formData.get("image_url") || "") || null,
      category: formData.get("category"),
      display_order: Number(formData.get("display_order") || 0),
      published: formData.get("published") === "on",
    });
    if (!parsed.success) return;
    const supabase = createClient();
    const payload = {
      ...parsed.data,
      image_url: parsed.data.image_url || null,
    };
    if (id) await supabase.from("services").update(payload).eq("id", id);
    else await supabase.from("services").insert(payload);
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this service?")) return;
    const supabase = createClient();
    await supabase.from("services").delete().eq("id", id);
    router.refresh();
  }

  async function move(s: Service, dir: -1 | 1) {
    const supabase = createClient();
    await supabase.from("services").update({ display_order: s.display_order + dir * 10 }).eq("id", s.id);
    router.refresh();
  }

  async function uploadImage(serviceId: string, file: File) {
    const supabase = createClient();
    const path = `services/${serviceId}-${file.name}`;
    const { error } = await supabase.storage.from("public-assets").upload(path, file, { upsert: true, contentType: file.type });
    if (error) return;
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    await supabase.from("services").update({ image_url: data.publicUrl }).eq("id", serviceId);
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <form action={(fd) => save(fd, editing?.id)} className="space-y-3">
        <h2 className="font-serif text-2xl">{editing ? "Edit service" : "New service"}</h2>
        <input name="title" required defaultValue={editing?.title} placeholder="Title" className={field} key={editing?.id || "new"} />
        <textarea name="short_description" defaultValue={editing?.short_description} placeholder="Short description" className={field} rows={4} />
        <input name="category" defaultValue={editing?.category} placeholder="Category" className={field} />
        <input name="image_url" defaultValue={editing?.image_url ?? ""} placeholder="Image URL (or upload after create)" className={field} />
        <input name="display_order" type="number" defaultValue={editing?.display_order ?? 0} className={field} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={editing?.published} /> Published
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-gold px-4 py-2 text-[11px] tracking-[0.2em] text-ink uppercase">
            Save
          </button>
          {editing ? (
            <button type="button" onClick={() => setEditing(null)} className="text-sm text-admin-muted">
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <ul className="space-y-3">
        {services.map((s) => (
          <li key={s.id} className="border border-admin-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl">{s.title}</p>
                <p className="text-xs text-admin-muted">
                  {s.category} · {s.published ? "Published" : "Hidden"} · order {s.display_order}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <button type="button" onClick={() => void move(s, -1)}>
                  Up
                </button>
                <button type="button" onClick={() => void move(s, 1)}>
                  Down
                </button>
                <button type="button" className="text-gold" onClick={() => setEditing(s)}>
                  Edit
                </button>
                <button type="button" className="text-red-300" onClick={() => void remove(s.id)}>
                  Delete
                </button>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="mt-3 text-xs"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(s.id, file);
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
