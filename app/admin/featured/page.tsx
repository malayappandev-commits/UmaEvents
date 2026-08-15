import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { EventFlagsBoard } from "@/components/admin/event-flags-board";
import type { Project } from "@/types";

export const metadata: Metadata = { title: "Featured Events" };

export default async function FeaturedEventsPage() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
  return (
    <div>
      <h1 className="font-serif text-4xl">Featured Events</h1>
      <p className="mt-2 text-sm text-admin-muted">
        Publish an event and mark it featured to show it on the homepage. Watch Live appears only when a live URL is saved.
      </p>
      {error ? <p className="mt-6 text-sm text-red-300">{error.message}</p> : null}
      <EventFlagsBoard projects={(data ?? []) as Project[]} mode="featured" />
    </div>
  );
}
