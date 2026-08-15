import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/guards";
import { AdminNav } from "@/components/admin/nav";
import { AdminHeader } from "@/components/admin/admin-header";
import { LastSeen } from "@/components/admin/last-seen";
import type { Notification } from "@/types";

export const metadata = {
  robots: { index: false, follow: false },
  title: { default: "Studio", template: "%s · Uma Events Studio" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, supabase } = await requireStaff();
  if (!profile) redirect("/login");

  let notifications: Notification[] = [];
  try {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    notifications = (data ?? []) as Notification[];
  } catch {
    notifications = [];
  }

  const name = profile.full_name || profile.email;

  return (
    <div className="admin-shell flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-admin-line bg-admin-panel p-5 md:flex">
        <Link href="/admin" className="font-serif text-2xl text-ivory">
          ADMIN PORTAL
        </Link>
        <p className="mt-1 text-[10px] tracking-[0.24em] text-gold uppercase">{profile.role}</p>
        <AdminNav role={profile.role} />
      </aside>
      <div className="min-w-0 flex-1">
        <AdminHeader name={name} notifications={notifications} />
        <div className="overflow-x-auto border-b border-admin-line px-3 py-2 md:hidden">
          <AdminNav role={profile.role} compact />
        </div>
        <main className="p-5 md:p-8">
          <LastSeen />
          {children}
        </main>
      </div>
    </div>
  );
}
