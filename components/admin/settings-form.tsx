"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { settingsSchema } from "@/lib/validations/settings";
import type { StudioSettings } from "@/types";

const field = "w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold";

export function SettingsForm({ settings }: { settings: StudioSettings }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setOk(false);
    const parsed = settingsSchema.safeParse({
      studio_name: formData.get("studio_name"),
      contact_email: formData.get("contact_email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      locations: String(formData.get("locations") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tagline: formData.get("tagline"),
      hero_headline: formData.get("hero_headline"),
      hero_subheadline: formData.get("hero_subheadline"),
      hero_image_url: formData.get("hero_image_url"),
      hero_video_url: formData.get("hero_video_url"),
      about_intro: formData.get("about_intro"),
      about_story: formData.get("about_story"),
      instagram_url: formData.get("instagram_url"),
      facebook_url: formData.get("facebook_url"),
      youtube_url: formData.get("youtube_url"),
      seo_title: formData.get("seo_title"),
      seo_description: formData.get("seo_description"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid");
      return;
    }
    const supabase = createClient();
    const { error: u } = await supabase.from("studio_settings").update(parsed.data).eq("id", 1);
    if (u) setError(u.message);
    else {
      setOk(true);
      router.refresh();
    }
  }

  async function uploadHero(kind: "image" | "video", file: File) {
    const supabase = createClient();
    const path = `hero/${kind}-${file.name}`;
    const { error: up } = await supabase.storage.from("public-assets").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (up) {
      setError(up.message);
      return;
    }
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    const patch = kind === "image" ? { hero_image_url: data.publicUrl } : { hero_video_url: data.publicUrl };
    await supabase.from("studio_settings").update(patch).eq("id", 1);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="mt-8 grid max-w-3xl gap-4">
      <input name="studio_name" defaultValue={settings.studio_name} className={field} />
      <input name="tagline" defaultValue={settings.tagline} placeholder="Tagline" className={field} />
      <input name="hero_headline" defaultValue={settings.hero_headline} placeholder="Hero headline" className={field} />
      <textarea name="hero_subheadline" defaultValue={settings.hero_subheadline} className={field} rows={2} />
      <input name="hero_image_url" defaultValue={settings.hero_image_url ?? ""} placeholder="Hero image URL" className={field} />
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && void uploadHero("image", e.target.files[0])} />
      <input name="hero_video_url" defaultValue={settings.hero_video_url ?? ""} placeholder="Hero video URL" className={field} />
      <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && void uploadHero("video", e.target.files[0])} />
      <textarea name="about_intro" defaultValue={settings.about_intro} rows={3} className={field} />
      <textarea name="about_story" defaultValue={settings.about_story} rows={8} className={field} />
      <input name="contact_email" type="email" defaultValue={settings.contact_email} placeholder="Email" className={field} />
      <input name="phone" defaultValue={settings.phone} placeholder="Phone" className={field} />
      <input name="address" defaultValue={settings.address} placeholder="Address" className={field} />
      <input name="locations" defaultValue={settings.locations?.join(", ")} placeholder="Locations, comma separated" className={field} />
      <input name="instagram_url" defaultValue={settings.instagram_url ?? ""} placeholder="Instagram" className={field} />
      <input name="facebook_url" defaultValue={settings.facebook_url ?? ""} placeholder="Facebook" className={field} />
      <input name="youtube_url" defaultValue={settings.youtube_url ?? ""} placeholder="YouTube" className={field} />
      <input name="seo_title" defaultValue={settings.seo_title} placeholder="SEO title" className={field} />
      <textarea name="seo_description" defaultValue={settings.seo_description} rows={3} className={field} />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {ok ? <p className="text-sm text-gold">Saved.</p> : null}
      <button type="submit" className="bg-gold px-5 py-3 text-[11px] tracking-[0.2em] text-ink uppercase">
        Save settings
      </button>
    </form>
  );
}
