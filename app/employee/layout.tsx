import Link from "next/link";
import { requireEmployeePortal } from "@/lib/auth/guards";
import { SignOutButton } from "@/components/admin/sign-out";
import { LastSeen } from "@/components/admin/last-seen";
import { isStaffRole } from "@/lib/auth/roles";

export const metadata = {
  robots: { index: false, follow: false },
  title: { default: "Workspace", template: "%s · Uma Events" },
};

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireEmployeePortal();

  return (
    <div className="min-h-screen bg-[#141210] text-ivory">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <Link href="/employee" className="font-serif text-2xl">
            Uma Events
          </Link>
          <p className="text-[10px] tracking-[0.24em] text-gold uppercase">Media workspace</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {isStaffRole(profile.role) ? (
            <Link href="/admin" className="text-ivory/50 hover:text-gold">
              Admin
            </Link>
          ) : null}
          <Link href="/employee/projects" className="text-ivory/70 hover:text-gold">
            Events
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <LastSeen />
        {children}
      </main>
    </div>
  );
}
