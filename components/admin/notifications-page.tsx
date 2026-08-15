"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDateShort } from "@/lib/utils";
import type { Notification } from "@/types";

export function NotificationsPageClient({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();

  async function markAll() {
    const supabase = createClient();
    const ids = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    router.refresh();
  }

  return (
    <div className="mt-8">
      <button type="button" onClick={() => void markAll()} className="text-[11px] uppercase text-gold">
        Mark all read
      </button>
      <ul className="mt-6 space-y-2">
        {notifications.map((n, i) => (
          <li key={n.id} className={i % 2 ? "bg-white/5 p-4" : "bg-white/10 p-4"}>
            <Link href={n.href || "/admin"} className="block">
              <p>{n.title}</p>
              {n.body ? <p className="text-sm text-admin-muted">{n.body}</p> : null}
              <p className="mt-1 text-xs text-admin-muted">{formatDateShort(n.created_at)}</p>
            </Link>
          </li>
        ))}
        {!notifications.length ? <li className="text-admin-muted">No notifications yet.</li> : null}
      </ul>
    </div>
  );
}
