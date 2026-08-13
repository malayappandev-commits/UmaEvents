import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/guards";
import { SignOutButton } from "@/components/admin/sign-out";
import { AdminNav } from "@/components/admin/nav";
import { LastSeen } from "@/components/admin/last-seen";

export const metadata = {
  robots: { index: false, follow: false },
  title: { default: "Studio", template: "%s · Uma Events Studio" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireStaff();
  if (!profile) redirect("/login");

  return (
    <div className="admin-shell flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-admin-line bg-admin-panel p-5 md:flex">
        <Link href="/admin" className="font-serif text-2xl text-ivory">
          Uma Events
        </Link>
        <p className="mt-1 text-[10px] tracking-[0.24em] text-gold uppercase">{profile.role}</p>
        <AdminNav role={profile.role} />
        <div className="mt-auto space-y-3 text-sm text-admin-muted">
          <p>{profile.full_name || profile.email}</p>
          <SignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-admin-line px-4 py-3 md:hidden">
          <Link href="/admin" className="font-serif text-xl">
            Uma
          </Link>
          <SignOutButton />
        </div>
        <div className="md:hidden overflow-x-auto border-b border-admin-line px-3 py-2">
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
