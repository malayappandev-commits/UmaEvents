import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireEmployeePortal } from "@/lib/auth/guards";
import { isStaffRole } from "@/lib/auth/roles";
import { MediaUploader } from "@/components/media/uploader";
import { EmployeeMediaGrid } from "@/components/employee/media-grid";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Upload" };

export default async function EmployeeProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { supabase, profile } = await requireEmployeePortal();

  if (!isStaffRole(profile.role)) {
    const { data: member } = await supabase
      .from("project_members")
      .select("id, assigned_at")
      .eq("project_id", projectId)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!member) notFound();
  }

  const { data: project } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (!project) notFound();

  const { data: media } = await supabase
    .from("media")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const { data: memberRow } = await supabase
    .from("project_members")
    .select("assigned_at")
    .eq("project_id", projectId)
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-gold">{project.event_type}</p>
        <h1 className="mt-2 font-serif text-4xl">{project.title}</h1>
        <p className="mt-2 text-ivory/60">
          {[project.location, formatDate(project.event_date)].filter(Boolean).join(" · ")}
        </p>
        {memberRow?.assigned_at ? (
          <p className="mt-1 text-xs text-ivory/40">Assigned {formatDate(memberRow.assigned_at)}</p>
        ) : null}
        <p className="mt-3 text-sm">{media?.length ?? 0} files</p>
      </div>
      <section>
        <h2 className="mb-4 font-serif text-3xl">Upload photos & videos</h2>
        <MediaUploader projectId={projectId} />
      </section>
      <section>
        <h2 className="mb-4 font-serif text-3xl">Uploaded media</h2>
        <EmployeeMediaGrid
          media={media ?? []}
          canDeleteId={isStaffRole(profile.role) ? undefined : profile.id}
        />
      </section>
    </div>
  );
}
