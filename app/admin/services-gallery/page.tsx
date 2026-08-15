import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { ServicesGalleryManager } from "@/components/admin/gallery-managers";
import type { Service, ServiceMedia } from "@/types";

export const metadata: Metadata = { title: "Services Gallery" };

export default async function ServicesGalleryPage() {
  const { supabase } = await requireStaff();
  const [{ data: services }, { data: media, error }] = await Promise.all([
    supabase.from("services").select("id, title, slug").order("display_order"),
    supabase.from("service_media").select("*").order("sort_order"),
  ]);
  return (
    <div>
      <h1 className="font-serif text-4xl">Services Gallery</h1>
      <p className="mt-2 text-sm text-admin-muted">
        Media uploaded here is stored in Supabase Storage and shown on the matching service detail page.
      </p>
      {error ? <p className="mt-6 text-sm text-red-300">{error.message}</p> : null}
      <ServicesGalleryManager
        services={(services ?? []) as Pick<Service, "id" | "title" | "slug">[]}
        media={(media ?? []) as ServiceMedia[]}
      />
    </div>
  );
}
