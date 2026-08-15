"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { serviceRatingSchema } from "@/lib/validations/cms";
import type { Service, ServiceRating } from "@/types";

const field = "w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold";

export function ServiceRatingsManager({
  services,
  ratings,
}: {
  services: Pick<Service, "id" | "title" | "slug">[];
  ratings: ServiceRating[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function save(formData: FormData) {
    setError("");
    const parsed = serviceRatingSchema.safeParse({
      service_id: formData.get("service_id"),
      customer_name: formData.get("customer_name"),
      rating: formData.get("rating"),
      review: formData.get("review"),
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid");
      return;
    }
    const supabase = createClient();
    const { error: dbError } = await supabase.from("service_ratings").insert(parsed.data);
    if (dbError) setError(dbError.message);
    else router.refresh();
  }

  async function toggle(id: string, published: boolean) {
    const supabase = createClient();
    await supabase.from("service_ratings").update({ published: !published }).eq("id", id);
    router.refresh();
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("service_ratings").delete().eq("id", id);
    router.refresh();
  }

  const byService = new Map(services.map((s) => [s.id, s]));

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <form action={save} className="space-y-3">
        <select name="service_id" required className={field} defaultValue={services[0]?.id}>
          {services.map((s) => (
            <option key={s.id} value={s.id} className="text-black">
              {s.title}
            </option>
          ))}
        </select>
        <input name="customer_name" placeholder="Customer name" className={field} />
        <input name="rating" type="number" min={1} max={5} defaultValue={5} className={field} />
        <textarea name="review" placeholder="Review" rows={4} className={field} />
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
          <li key={r.id} className="border border-admin-line p-4 text-sm">
            <p>
              {byService.get(r.service_id)?.title || "Service"} · {r.rating}/5
            </p>
            <p className="text-admin-muted">{r.customer_name}</p>
            {r.review ? <p className="mt-2">{r.review}</p> : null}
            <div className="mt-2 flex gap-3 text-xs">
              <button type="button" onClick={() => void toggle(r.id, r.published)}>
                {r.published ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="text-red-300" onClick={() => void remove(r.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {!ratings.length ? <li className="text-admin-muted">No service ratings yet.</li> : null}
      </ul>
    </div>
  );
}
