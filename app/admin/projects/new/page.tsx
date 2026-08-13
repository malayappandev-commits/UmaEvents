import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata: Metadata = { title: "New event" };

export default async function NewProjectPage() {
  const { supabase } = await requireStaff();
  const { data: employees } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "EMPLOYEE")
    .eq("status", "ACTIVE");

  return (
    <div>
      <h1 className="mb-8 font-serif text-4xl">New event</h1>
      <ProjectForm employees={employees ?? []} assignedIds={[]} />
    </div>
  );
}
