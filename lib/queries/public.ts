import { createAnonClient } from "@/lib/supabase/anon";
import { supabaseConfigured } from "@/lib/supabase/env";
import type {
  GalleryMedia,
  Media,
  Project,
  Service,
  ServiceMedia,
  ServiceRating,
  SiteRating,
  StudioSettings,
  Testimonial,
  WhyChooseUsItem,
} from "@/types";

async function safeList<T>(run: () => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  if (!supabaseConfigured()) return [];
  try {
    const { data, error } = await run();
    if (error) return [];
    return (data ?? []) as T[];
  } catch {
    return [];
  }
}

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

export async function getPublishedServiceBySlug(slug: string) {
  if (!supabaseConfigured()) return null;
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data as Service | null;
}

export async function getServiceMedia(serviceId: string) {
  return safeList<ServiceMedia>(() =>
    createAnonClient()
      .from("service_media")
      .select("*")
      .eq("service_id", serviceId)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  );
}

export async function getServiceRatings(serviceId: string) {
  return safeList<ServiceRating>(() =>
    createAnonClient()
      .from("service_ratings")
      .select("*")
      .eq("service_id", serviceId)
      .eq("published", true)
      .order("created_at", { ascending: false }),
  );
}

export async function getPublishedProjects(options?: { featured?: boolean; eventType?: string; milestones?: boolean }) {
  if (!supabaseConfigured()) return [];
  const supabase = createAnonClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("event_date", { ascending: false, nullsFirst: false });

  if (options?.featured) query = query.eq("featured", true);
  if (options?.eventType) query = query.eq("event_type", options.eventType);
  if (options?.milestones) {
    query = supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .eq("is_milestone", true)
      .order("milestone_order", { ascending: true })
      .order("event_date", { ascending: false, nullsFirst: false });
  }

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

export async function getPublishedSiteRatings() {
  return safeList<SiteRating>(() =>
    createAnonClient()
      .from("site_ratings")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true }),
  );
}

export async function getPublishedTestimonials() {
  return safeList<Testimonial>(() =>
    createAnonClient()
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true }),
  );
}

export async function getPublishedWhyChooseUs() {
  return safeList<WhyChooseUsItem>(() =>
    createAnonClient()
      .from("why_choose_us_items")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true }),
  );
}

export async function getPublishedGalleryMedia() {
  return safeList<GalleryMedia>(() =>
    createAnonClient()
      .from("gallery_media")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("event_date", { ascending: false, nullsFirst: false }),
  );
}

export async function signMediaUrl(path: string | null | undefined, expiresIn = 60 * 60 * 24) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const supabase = createAnonClient();
  const { data } = await supabase.storage.from("project-media").createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

export function publicAssetUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const supabase = createAnonClient();
  return supabase.storage.from("public-assets").getPublicUrl(path).data.publicUrl;
}
