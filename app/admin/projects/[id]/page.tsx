import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/guards";
import { ProjectForm } from "@/components/admin/project-form";
import { MediaUploader } from "@/components/media/uploader";
import type { Project } from "@/types";

export const metadata: Metadata = { title: "Edit event" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!project) notFound();

  const [{ data: employees }, { data: members }, media] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").eq("role", "EMPLOYEE"),
    supabase.from("project_members").select("user_id").eq("project_id", id),
    supabase.from("media").select("id", { count: "exact", head: true }).eq("project_id", id),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-4xl">{project.title}</h1>
        <p className="mt-2 text-admin-muted">{media.count ?? 0} media files</p>
        <Link href={`/admin/media?project=${id}`} className="mt-2 inline-block text-sm text-gold">
          Open media library →
        </Link>
      </div>
      <ProjectForm
        project={project as Project}
        employees={employees ?? []}
        assignedIds={(members ?? []).map((m) => m.user_id)}
      />
      <section>
        <h2 className="mb-4 font-serif text-3xl">Upload</h2>
        <MediaUploader projectId={id} />
      </section>
    </div>
  );
}
