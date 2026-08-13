"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, UserRole } from "@/types";

export function EmployeesManager({
  people,
  projects,
  uploadCounts,
  assignments,
  actorRole,
}: {
  people: Profile[];
  projects: { id: string; title: string }[];
  uploadCounts: Record<string, number>;
  assignments: Record<string, string[]>;
  actorRole: UserRole;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function createEmployee(formData: FormData) {
    setError("");
    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: formData.get("full_name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
      }),
    });
    const json = await res.json();
    if (!res.ok) setError(json.error?.toString?.() || "Could not create");
    else router.refresh();
  }

  async function toggleStatus(p: Profile) {
    const res = await fetch("/api/admin/employees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: p.id,
        status: p.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
      }),
    });
    if (res.ok) router.refresh();
  }

  async function saveAssignments(userId: string, formData: FormData) {
    const project_ids = formData.getAll("project_ids").map(String);
    await fetch("/api/admin/employees", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, project_ids }),
    });
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-10">
      <form action={createEmployee} className="grid gap-3 rounded-xl border border-admin-line p-4 md:grid-cols-4">
        <input name="full_name" required placeholder="Full name" className="border border-white/15 bg-transparent px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="Email" className="border border-white/15 bg-transparent px-3 py-2 text-sm" />
        <input name="password" type="password" required minLength={8} placeholder="Temporary password" className="border border-white/15 bg-transparent px-3 py-2 text-sm" />
        <select name="role" className="border border-white/15 bg-transparent px-3 py-2 text-sm">
          <option value="EMPLOYEE" className="text-black">
            Employee
          </option>
          {actorRole === "OWNER" ? (
            <option value="ADMIN" className="text-black">
              Admin
            </option>
          ) : null}
        </select>
        <button type="submit" className="bg-gold px-4 py-2 text-[11px] tracking-[0.2em] text-ink uppercase md:col-span-4">
          Create person
        </button>
        {error ? <p className="text-sm text-red-300 md:col-span-4">{error}</p> : null}
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.16em] text-admin-muted uppercase">
            <tr>
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Events</th>
              <th className="pb-3">Uploads</th>
              <th className="pb-3">Last seen</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id} className="border-t border-admin-line align-top">
                <td className="py-3">{p.full_name || "—"}</td>
                <td>{p.email}</td>
                <td>{p.role}</td>
                <td>{p.status}</td>
                <td className="max-w-xs text-admin-muted">
                  {(assignments[p.id] || [])
                    .map((id) => projects.find((pr) => pr.id === id)?.title || id)
                    .join(", ") || "—"}
                </td>
                <td>{uploadCounts[p.id] || 0}</td>
                <td className="text-admin-muted">{p.last_seen_at ? p.last_seen_at.slice(0, 10) : "—"}</td>
                <td>
                  {p.role !== "OWNER" ? (
                    <button type="button" onClick={() => void toggleStatus(p)} className="text-gold">
                      {p.status === "ACTIVE" ? "Disable" : "Activate"}
                    </button>
                  ) : (
                    "—"
                  )}
                  {p.role === "EMPLOYEE" ? (
                    <form action={(fd) => saveAssignments(p.id, fd)} className="mt-3 space-y-1">
                      {projects.map((pr) => (
                        <label key={pr.id} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            name="project_ids"
                            value={pr.id}
                            defaultChecked={(assignments[p.id] || []).includes(pr.id)}
                          />
                          {pr.title}
                        </label>
                      ))}
                      <button type="submit" className="text-[10px] uppercase tracking-widest text-gold">
                        Save assignments
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
