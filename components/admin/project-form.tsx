"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { projectSchema } from "@/lib/validations/project";
import { slugify } from "@/lib/utils";
import type { Profile, Project } from "@/types";

const field =
  "w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold";

export function ProjectForm({
  project,
  employees,
  assignedIds,
}: {
  project?: Project;
  employees: Pick<Profile, "id" | "full_name" | "email">[];
  assignedIds: string[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [assigned, setAssigned] = useState<string[]>(assignedIds);
  const [highlights, setHighlights] = useState((project?.event_highlights || []).join("\n"));

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const title = String(formData.get("title") || "");
    const raw = {
      title,
      slug: String(formData.get("slug") || slugify(title)),
      event_type: String(formData.get("event_type") || ""),
      location: String(formData.get("location") || ""),
      event_date: String(formData.get("event_date") || "") || null,
      description: String(formData.get("description") || ""),
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      client_name: String(formData.get("client_name") || "") || null,
      show_client_publicly: formData.get("show_client_publicly") === "on",
      photographer: String(formData.get("photographer") || "") || null,
      videographer: String(formData.get("videographer") || "") || null,
      guest_count: formData.get("guest_count") ? Number(formData.get("guest_count")) : null,
      event_highlights: highlights
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      live_url: String(formData.get("live_url") || "") || null,
      is_milestone: formData.get("is_milestone") === "on",
      milestone_order: Number(formData.get("milestone_order") || 0),
      milestone_description: String(formData.get("milestone_description") || ""),
    };
    const parsed = projectSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid");
      setPending(false);
      return;
    }
    const supabase = createClient();
    const payload = {
      ...parsed.data,
      live_url: parsed.data.live_url || null,
    };
    if (project) {
      const { error: u } = await supabase.from("projects").update(payload).eq("id", project.id);
      if (u) {
        setError(u.message);
        setPending(false);
        return;
      }
      await supabase.from("project_members").delete().eq("project_id", project.id);
      if (assigned.length) {
        await supabase.from("project_members").insert(
          assigned.map((user_id) => ({ project_id: project.id, user_id })),
        );
      }
      router.push("/admin/projects");
      router.refresh();
    } else {
      const { data, error: i } = await supabase.from("projects").insert(payload).select("id").single();
      if (i || !data) {
        setError(i?.message || "Could not create");
        setPending(false);
        return;
      }
      if (assigned.length) {
        await supabase.from("project_members").insert(
          assigned.map((user_id) => ({ project_id: data.id, user_id })),
        );
      }
      router.push(`/admin/projects/${data.id}`);
      router.refresh();
    }
  }

  async function onDelete() {
    if (!project) return;
    if (!confirm("Delete this event and its media records?")) return;
    const supabase = createClient();
    const { error: d } = await supabase.from("projects").delete().eq("id", project.id);
    if (d) setError(d.message);
    else {
      router.push("/admin/projects");
      router.refresh();
    }
  }

  return (
    <form action={onSubmit} className="grid max-w-3xl gap-4">
      <input name="title" defaultValue={project?.title} required placeholder="Title" className={field} />
      <input name="slug" defaultValue={project?.slug} placeholder="slug" className={field} />
      <div className="grid gap-4 md:grid-cols-2">
        <input name="event_type" defaultValue={project?.event_type} placeholder="Event type" className={field} />
        <input name="location" defaultValue={project?.location} placeholder="Location" className={field} />
        <input name="event_date" type="date" defaultValue={project?.event_date ?? ""} className={field} />
        <input name="guest_count" type="number" min={1} defaultValue={project?.guest_count ?? ""} placeholder="Guest count" className={field} />
      </div>
      <textarea name="description" defaultValue={project?.description} rows={6} placeholder="Story" className={field} />
      <textarea
        value={highlights}
        onChange={(e) => setHighlights(e.target.value)}
        rows={4}
        placeholder="Highlights — one per line"
        className={field}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input name="client_name" defaultValue={project?.client_name ?? ""} placeholder="Client name (private by default)" className={field} />
        <input name="photographer" defaultValue={project?.photographer ?? ""} placeholder="Photographer" className={field} />
        <input name="videographer" defaultValue={project?.videographer ?? ""} placeholder="Videographer" className={field} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="show_client_publicly" defaultChecked={project?.show_client_publicly} />
        Show client name publicly
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={project?.published} /> Published
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={project?.featured} /> Featured
      </label>
      <input name="live_url" defaultValue={project?.live_url ?? ""} placeholder="Live stream URL (Watch Live)" className={field} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_milestone" defaultChecked={project?.is_milestone} /> Remarkable milestone
      </label>
      <input name="milestone_order" type="number" defaultValue={project?.milestone_order ?? 0} placeholder="Milestone order" className={field} />
      <textarea name="milestone_description" defaultValue={project?.milestone_description ?? ""} rows={3} placeholder="Milestone description" className={field} />
      <div>
        <p className="mb-2 text-[11px] tracking-[0.16em] uppercase text-admin-muted">Assign employees</p>
        <div className="grid gap-2">
          {employees.map((e) => (
            <label key={e.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={assigned.includes(e.id)}
                onChange={(ev) =>
                  setAssigned((prev) =>
                    ev.target.checked ? [...prev, e.id] : prev.filter((id) => id !== e.id),
                  )
                }
              />
              {e.full_name || e.email}
            </label>
          ))}
          {!employees.length ? <p className="text-admin-muted">No employees yet.</p> : null}
        </div>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="bg-gold px-5 py-2 text-[11px] tracking-[0.2em] text-ink uppercase">
          {pending ? "Saving…" : "Save"}
        </button>
        {project ? (
          <button type="button" onClick={onDelete} className="border border-red-400/40 px-5 py-2 text-[11px] uppercase text-red-300">
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
