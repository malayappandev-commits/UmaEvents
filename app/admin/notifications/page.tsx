import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { NotificationsPageClient } from "@/components/admin/notifications-page";
import type { Notification } from "@/types";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="font-serif text-4xl">Notifications</h1>
      {error ? <p className="mt-6 text-sm text-red-300">{error.message}</p> : null}
      <NotificationsPageClient notifications={(data ?? []) as Notification[]} />
    </div>
  );
}
