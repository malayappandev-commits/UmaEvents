import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { EmployeesManager } from "@/components/admin/employees-manager";

export const metadata: Metadata = { title: "People" };

export default async function EmployeesPage() {
  const { supabase, profile } = await requireStaff();
  const { data: people } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const ids = (people ?? []).map((p) => p.id);
  const { data: members } = ids.length
    ? await supabase.from("project_members").select("user_id, project_id")
    : { data: [] };
  const { data: uploads } = ids.length
    ? await supabase.from("media").select("uploaded_by")
    : { data: [] };
  const { data: projects } = await supabase.from("projects").select("id, title").order("title");

  const uploadCounts = new Map<string, number>();
  for (const u of uploads ?? []) {
    if (!u.uploaded_by) continue;
    uploadCounts.set(u.uploaded_by, (uploadCounts.get(u.uploaded_by) || 0) + 1);
  }

  const assignments = new Map<string, string[]>();
  for (const m of members ?? []) {
    assignments.set(m.user_id, [...(assignments.get(m.user_id) || []), m.project_id]);
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Employee Management</h1>
      <EmployeesManager
        people={people ?? []}
        projects={projects ?? []}
        uploadCounts={Object.fromEntries(uploadCounts)}
        assignments={Object.fromEntries(assignments)}
        actorRole={profile.role}
      />
    </div>
  );
}
