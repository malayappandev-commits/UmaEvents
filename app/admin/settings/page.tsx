import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { SettingsForm } from "@/components/admin/settings-form";
import type { StudioSettings } from "@/types";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("studio_settings").select("*").eq("id", 1).single();
  return (
    <div>
      <h1 className="font-serif text-4xl">Website settings</h1>
      <SettingsForm settings={data as StudioSettings} />
    </div>
  );
}
