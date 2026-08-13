import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { formatDateShort } from "@/lib/utils";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("activity")
    .select("id, action, entity_type, entity_id, metadata, created_at, actor_id")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="font-serif text-4xl">Activity</h1>
      <ul className="mt-8 space-y-3 text-sm">
        {(data ?? []).map((a) => (
          <li key={a.id} className="border-b border-admin-line pb-3">
            <p className="capitalize">{a.action.replaceAll("_", " ")}</p>
            <p className="text-xs text-admin-muted">
              {a.entity_type} · {formatDateShort(a.created_at)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
