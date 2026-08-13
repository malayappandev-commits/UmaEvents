import { createAnonClient } from "@/lib/supabase/anon";
import { supabaseConfigured } from "@/lib/supabase/env";
import type { Media, Project, Service, StudioSettings } from "@/types";

export async function getSettings() {
  if (!supabaseConfigured()) return null;
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("studio_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data as StudioSettings | null;
}

export async function getPublishedServices() {
  if (!supabaseConfigured()) return [];
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getPublishedProjects(options?: { featured?: boolean; eventType?: string }) {
  if (!supabaseConfigured()) return [];
  const supabase = createAnonClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("event_date", { ascending: false, nullsFirst: false });

  if (options?.featured) query = query.eq("featured", true);
  if (options?.eventType) query = query.eq("event_type", options.eventType);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProjectBySlug(slug: string) {
  if (!supabaseConfigured()) return null;
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function getProjectMedia(projectId: string) {
  if (!supabaseConfigured()) return [];
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", "READY")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Media[];
}

export async function getCoverMap(projects: Project[]) {
  const ids = projects.map((p) => p.cover_media_id).filter(Boolean) as string[];
  if (!ids.length) return new Map<string, Media>();
  const supabase = createAnonClient();
  const { data } = await supabase.from("media").select("*").in("id", ids).eq("status", "READY");
  const map = new Map<string, Media>();
  for (const row of (data ?? []) as Media[]) {
    map.set(row.id, row);
  }
  return map;
}

export async function getEventTypes() {
  if (!supabaseConfigured()) return [];
  const supabase = createAnonClient();
  const { data } = await supabase.from("projects").select("event_type").eq("published", true);
  const types = Array.from(
    new Set((data ?? []).map((r: { event_type: string }) => r.event_type).filter(Boolean)),
  ).sort();
  return types;
}

export async function signMediaUrl(path: string | null | undefined, expiresIn = 60 * 60 * 24) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const supabase = createAnonClient();
  const { data } = await supabase.storage.from("project-media").createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}
