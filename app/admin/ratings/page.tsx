import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { SiteRatingsManager } from "@/components/admin/home-cms-managers";
import type { SiteRating } from "@/types";

export const metadata: Metadata = { title: "Homepage ratings" };

export default async function HomepageRatingsPage() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from("site_ratings").select("*").order("display_order");
  return (
    <div>
      <h1 className="font-serif text-4xl">Homepage ratings</h1>
      <p className="mt-2 text-sm text-admin-muted">Published metrics appear in the homepage Ratings section.</p>
      {error ? <p className="mt-6 text-sm text-red-300">{error.message}</p> : null}
      <SiteRatingsManager ratings={(data ?? []) as SiteRating[]} />
    </div>
  );
}
