import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { MainGalleryManager } from "@/components/admin/gallery-managers";
import type { GalleryMedia } from "@/types";

export const metadata: Metadata = { title: "Main Gallery" };

export default async function MainGalleryPage() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from("gallery_media").select("*").order("display_order");
  return (
    <div>
      <h1 className="font-serif text-4xl">Main Gallery</h1>
      <p className="mt-2 text-sm text-admin-muted">
        Uploads go to Supabase Storage. Published items appear under Latest Events on the public Gallery page.
      </p>
      {error ? <p className="mt-6 text-sm text-red-300">{error.message}</p> : null}
      <MainGalleryManager items={(data ?? []) as GalleryMedia[]} />
    </div>
  );
}
