"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";

export function AdminHeader({
  name,
  notifications,
}: {
  name: string;
  notifications: Notification[];
}) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read_at).length;

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    router.refresh();
  }

  return (
    <header className="relative flex items-center justify-between border-b border-admin-line px-4 py-3 md:px-8">
      <p className="text-sm text-admin-muted md:absolute md:inset-x-0 md:text-center">
        Welcome {name}
      </p>
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="relative h-9 w-9 rounded-full border border-admin-line text-xs"
          onClick={() => {
            setNotesOpen((v) => !v);
            setProfileOpen(false);
          }}
          aria-label="Notifications"
        >
          N
          {unread ? (
            <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] text-white">
              {unread}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className="h-9 w-9 rounded-full border border-admin-line text-xs"
          onClick={() => {
            setProfileOpen((v) => !v);
            setNotesOpen(false);
          }}
          aria-label="Account"
        >
          P
        </button>
      </div>
      {notesOpen ? (
        <div className="absolute right-4 top-14 z-20 w-80 border border-admin-line bg-admin-panel p-3 shadow-lg">
          <p className="text-[11px] tracking-[0.16em] uppercase text-gold">Notifications</p>
          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
            {notifications.map((n) => (
              <li key={n.id} className={n.read_at ? "bg-white/5 p-2" : "bg-white/10 p-2"}>
                <Link href={n.href || "/admin/notifications"} onClick={() => void markRead(n.id)}>
                  <p>{n.title}</p>
                  {n.body ? <p className="text-xs text-admin-muted">{n.body}</p> : null}
                </Link>
              </li>
            ))}
            {!notifications.length ? <li className="text-admin-muted">No notifications.</li> : null}
          </ul>
          <Link href="/admin/notifications" className="mt-3 block text-[11px] uppercase text-gold">
            Open notifications
          </Link>
        </div>
      ) : null}
      {profileOpen ? (
        <div className="absolute right-4 top-14 z-20 w-44 border border-admin-line bg-admin-panel p-2">
          <Link href="/admin/profile" className="block bg-white/10 px-3 py-2 text-sm">
            profile
          </Link>
          <button type="button" onClick={() => void logout()} className="mt-1 block w-full bg-red-700 px-3 py-2 text-left text-sm">
            Logout
          </button>
        </div>
      ) : null}
    </header>
  );
}
