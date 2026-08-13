import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { MediaLibrary } from "@/components/admin/media-library";

export const metadata: Metadata = { title: "Media" };

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  const { supabase } = await requireStaff();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .order("title");

  return (
    <div>
      <h1 className="font-serif text-4xl">Media library</h1>
      <p className="mt-2 text-sm text-admin-muted">Paginated. Original files stay in storage — this view loads metadata first.</p>
      <MediaLibrary projects={projects ?? []} initialProjectId={project} />
    </div>
  );
}
