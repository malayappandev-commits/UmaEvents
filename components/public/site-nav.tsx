"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "AboutUS" },
];

export function SiteNav({ studioName }: { studioName: string }) {
  const pathname = usePathname();
  const overlay = pathname === "/";
  const tone = overlay ? "text-ivory" : "text-charcoal";
  const muted = overlay ? "text-ivory/80 hover:text-gold" : "text-charcoal/70 hover:text-earth";
  const cta = overlay
    ? "border-gold/50 text-ivory hover:bg-gold/10"
    : "border-charcoal/20 text-charcoal hover:border-gold hover:text-earth";

  return (
    <header className={cn("z-50", overlay ? "absolute inset-x-0 top-0" : "sticky top-0 bg-ivory/90 backdrop-blur-md")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className={cn("font-serif text-xl tracking-[0.18em] uppercase", tone)}>
          {studioName}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-[11px] tracking-[0.28em] uppercase transition",
                muted,
                pathname === l.href && (overlay ? "text-gold" : "text-earth"),
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className={cn(
            "border px-4 py-2 text-[10px] tracking-[0.28em] uppercase transition",
            cta,
          )}
        >
          ContactUs
        </Link>
      </div>
      <nav className={cn("flex gap-4 overflow-x-auto px-6 pb-4 md:hidden", muted)}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="shrink-0 text-[10px] tracking-[0.22em] uppercase">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
