import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { EventFlagsBoard } from "@/components/admin/event-flags-board";
import type { Project } from "@/types";

export const metadata: Metadata = { title: "Remarkable Milestones" };

export default async function MilestonesPage() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from("projects").select("*").order("milestone_order", { ascending: true });
  return (
    <div>
      <h1 className="font-serif text-4xl">Remarkable Milestones</h1>
      <p className="mt-2 text-sm text-admin-muted">
        Mark published events as milestones. Order controls presentation on the public Gallery page.
      </p>
      {error ? <p className="mt-6 text-sm text-red-300">{error.message}</p> : null}
      <EventFlagsBoard projects={(data ?? []) as Project[]} mode="milestones" />
    </div>
  );
}
