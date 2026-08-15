import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { ServiceRatingsManager } from "@/components/admin/service-ratings-manager";
import type { Service, ServiceRating } from "@/types";

export const metadata: Metadata = { title: "Service Ratings" };

export default async function ServiceRatingsPage() {
  const { supabase } = await requireStaff();
  const [{ data: services }, { data: ratings, error }] = await Promise.all([
    supabase.from("services").select("id, title, slug").order("display_order"),
    supabase.from("service_ratings").select("*").order("created_at", { ascending: false }),
  ]);
  return (
    <div>
      <h1 className="font-serif text-4xl">Service Ratings</h1>
      <p className="mt-2 text-sm text-admin-muted">
        Ratings stay off the public service page until published. Empty services show an empty state.
      </p>
      {error ? <p className="mt-6 text-sm text-red-300">{error.message}</p> : null}
      <ServiceRatingsManager
        services={(services ?? []) as Pick<Service, "id" | "title" | "slug">[]}
        ratings={(ratings ?? []) as ServiceRating[]}
      />
    </div>
  );
}
