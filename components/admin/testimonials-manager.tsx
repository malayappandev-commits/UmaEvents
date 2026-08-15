"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Testimonial } from "@/types";
import { testimonialSchema } from "@/lib/validations/cms";

const field = "w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold";

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [error, setError] = useState("");

  async function save(formData: FormData, id?: string) {
    setError("");
    const parsed = testimonialSchema.safeParse({
      quote: formData.get("quote"),
      author_name: formData.get("author_name"),
      author_role: formData.get("author_role"),
      display_order: Number(formData.get("display_order") || 0),
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid");
      return;
    }
    const supabase = createClient();
    const { error: dbError } = id
      ? await supabase.from("testimonials").update(parsed.data).eq("id", id)
      : await supabase.from("testimonials").insert(parsed.data);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this testimonial?")) return;
    const supabase = createClient();
    await supabase.from("testimonials").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <form action={(fd) => save(fd, editing?.id)} className="space-y-3" key={editing?.id || "new"}>
        <h2 className="font-serif text-2xl">{editing ? "Edit testimonial" : "New testimonial"}</h2>
        <textarea name="quote" required defaultValue={editing?.quote} placeholder="Quote" rows={5} className={field} />
        <input name="author_name" defaultValue={editing?.author_name} placeholder="Author name" className={field} />
        <input name="author_role" defaultValue={editing?.author_role} placeholder="Role / event" className={field} />
        <input name="display_order" type="number" defaultValue={editing?.display_order ?? 0} className={field} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={editing?.published} /> Published
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button type="submit" className="bg-gold px-4 py-2 text-[11px] tracking-[0.2em] text-ink uppercase">
          Save
        </button>
      </form>
      <ul className="space-y-3">
        {testimonials.map((t) => (
          <li key={t.id} className="border border-admin-line p-4">
            <p className="text-sm">{t.quote}</p>
            <p className="mt-2 text-xs text-admin-muted">
              {t.author_name} · {t.published ? "Published" : "Hidden"}
            </p>
            <div className="mt-2 flex gap-3 text-xs">
              <button type="button" className="text-gold" onClick={() => setEditing(t)}>
                Edit
              </button>
              <button type="button" className="text-red-300" onClick={() => void remove(t.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {!testimonials.length ? <li className="text-admin-muted">No testimonials yet. The homepage will stay empty until you publish one.</li> : null}
      </ul>
    </div>
  );
}
