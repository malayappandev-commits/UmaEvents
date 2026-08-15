"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const field = "w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function save(formData: FormData) {
    setError("");
    setOk(false);
    const supabase = createClient();
    const { error: u } = await supabase
      .from("profiles")
      .update({
        full_name: String(formData.get("full_name") || ""),
        avatar_url: String(formData.get("avatar_url") || "") || null,
      })
      .eq("id", profile.id);
    if (u) setError(u.message);
    else {
      setOk(true);
      router.refresh();
    }
  }

  async function uploadAvatar(file: File) {
    const supabase = createClient();
    const path = `avatars/${profile.id}-${file.name}`;
    const { error: up } = await supabase.storage.from("public-assets").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (up) {
      setError(up.message);
      return;
    }
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
    router.refresh();
  }

  return (
    <form action={save} className="mt-8 max-w-lg space-y-3">
      <p className="text-sm text-admin-muted">{profile.email}</p>
      <input name="full_name" defaultValue={profile.full_name} placeholder="Full name" className={field} />
      <input name="avatar_url" defaultValue={profile.avatar_url ?? ""} placeholder="Avatar URL" className={field} />
      <input
        type="file"
        accept="image/*"
        className="text-sm"
        onChange={(e) => e.target.files?.[0] && void uploadAvatar(e.target.files[0])}
      />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {ok ? <p className="text-sm text-gold">Saved.</p> : null}
      <button type="submit" className="bg-gold px-4 py-2 text-[11px] tracking-[0.2em] text-ink uppercase">
        Save profile
      </button>
    </form>
  );
}
