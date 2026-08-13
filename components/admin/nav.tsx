"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Events" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/employees", label: "People" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/activity", label: "Activity" },
];

export function AdminNav({ role, compact }: { role: UserRole; compact?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={cn(compact ? "flex gap-3" : "mt-10 flex flex-col gap-1")}>
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap px-3 py-2 text-[12px] tracking-[0.16em] uppercase transition",
              active ? "bg-white/5 text-gold" : "text-ivory/60 hover:text-ivory",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      {role === "OWNER" || role === "ADMIN" ? (
        <Link href="/employee" className="px-3 py-2 text-[11px] text-ivory/30 hover:text-ivory/60">
          Employee view
        </Link>
      ) : null}
    </nav>
  );
}
