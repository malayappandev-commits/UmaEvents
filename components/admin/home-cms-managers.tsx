"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteRatingSchema, whyChooseUsSchema } from "@/lib/validations/cms";
import type { SiteRating, WhyChooseUsItem } from "@/types";

const field = "w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold";

export function SiteRatingsManager({ ratings }: { ratings: SiteRating[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function save(formData: FormData) {
    setError("");
    const parsed = siteRatingSchema.safeParse({
      label: formData.get("label"),
      value: formData.get("value"),
      caption: formData.get("caption"),
      display_order: Number(formData.get("display_order") || 0),
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid");
      return;
    }
    const supabase = createClient();
    const { error: dbError } = await supabase.from("site_ratings").insert(parsed.data);
    if (dbError) setError(dbError.message);
    else router.refresh();
  }

  async function toggle(id: string, published: boolean) {
    const supabase = createClient();
    await supabase.from("site_ratings").update({ published: !published }).eq("id", id);
    router.refresh();
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("site_ratings").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <form action={save} className="space-y-3">
        <input name="value" required placeholder="Value (e.g. 4.9)" className={field} />
        <input name="label" required placeholder="Label" className={field} />
        <input name="caption" placeholder="Caption" className={field} />
        <input name="display_order" type="number" defaultValue={0} className={field} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" /> Published
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button type="submit" className="bg-gold px-4 py-2 text-[11px] tracking-[0.2em] text-ink uppercase">
          Add rating
        </button>
      </form>
      <ul className="space-y-3">
        {ratings.map((r) => (
          <li key={r.id} className="flex items-center justify-between border border-admin-line p-3 text-sm">
            <span>
              {r.value} · {r.label} {r.published ? "" : "(hidden)"}
            </span>
            <span className="flex gap-3 text-xs">
              <button type="button" onClick={() => void toggle(r.id, r.published)}>
                {r.published ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="text-red-300" onClick={() => void remove(r.id)}>
                Delete
              </button>
            </span>
          </li>
        ))}
        {!ratings.length ? <li className="text-admin-muted">No homepage ratings yet.</li> : null}
      </ul>
    </div>
  );
}

export function WhyChooseUsManager({ items }: { items: WhyChooseUsItem[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function save(formData: FormData) {
    setError("");
    const parsed = whyChooseUsSchema.safeParse({
      title: formData.get("title"),
      body: formData.get("body"),
      display_order: Number(formData.get("display_order") || 0),
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid");
      return;
    }
    const supabase = createClient();
    const { error: dbError } = await supabase.from("why_choose_us_items").insert(parsed.data);
    if (dbError) setError(dbError.message);
    else router.refresh();
  }

  async function toggle(id: string, published: boolean) {
    const supabase = createClient();
    await supabase.from("why_choose_us_items").update({ published: !published }).eq("id", id);
    router.refresh();
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("why_choose_us_items").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <form action={save} className="space-y-3">
        <input name="title" required placeholder="Title" className={field} />
        <textarea name="body" placeholder="Body" rows={4} className={field} />
        <input name="display_order" type="number" defaultValue={0} className={field} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" /> Published
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button type="submit" className="bg-gold px-4 py-2 text-[11px] tracking-[0.2em] text-ink uppercase">
          Add item
        </button>
      </form>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="border border-admin-line p-3 text-sm">
            <p className="font-serif text-xl">{item.title}</p>
            <p className="text-xs text-admin-muted">{item.published ? "Published" : "Hidden"}</p>
            <div className="mt-2 flex gap-3 text-xs">
              <button type="button" onClick={() => void toggle(item.id, item.published)}>
                {item.published ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="text-red-300" onClick={() => void remove(item.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {!items.length ? <li className="text-admin-muted">No Why Choose Us items yet.</li> : null}
      </ul>
    </div>
  );
}
