"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BRAND_NAME, PUBLIC_NAV } from "@/lib/public/nav";

function detectSurface(pathname: string): "dark" | "light" {
  const header = document.querySelector(".uma-nav");
  const navH = header instanceof HTMLElement ? header.offsetHeight : 72;
  const x = Math.min(Math.max(window.innerWidth / 2, 24), window.innerWidth - 24);
  const y = Math.min(navH + 8, window.innerHeight - 4);
  const stack = document.elementsFromPoint(x, y);

  for (const el of stack) {
    if (!(el instanceof Element)) continue;
    if (el.closest(".uma-nav, .uma-intro")) continue;

    const dark = el.closest(
      ".uma-hero, .uma-chapter--ink, .uma-quote-band, .uma-footer, .bg-ink, .uma-surface-dark",
    );
    if (dark) return "dark";

    const light = el.closest(".uma-chapter--ivory, .uma-chapter--cream, .uma-page, .bg-ivory, .bg-cream");
    if (light) return "light";
  }

  if (pathname === "/" && window.scrollY < 80) return "dark";
  return "light";
}

export function SiteNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [surface, setSurface] = useState<"dark" | "light">(pathname === "/" ? "dark" : "light");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      setScrolled(window.scrollY > 24);
      setSurface(detectSurface(pathname));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    update();
    const later = window.setTimeout(update, 180);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(later);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("uma-nav-open", open);
    return () => document.body.classList.remove("uma-nav-open");
  }, [open]);

  const onDark = open || surface === "dark";

  return (
    <header
      className={cn(
        "uma-nav",
        onDark ? "uma-nav--dark" : "uma-nav--light",
        scrolled && !open && "uma-nav--soft",
        open && "uma-nav--open",
      )}
    >
      <div className="uma-nav-bar">
        <Link href="/" className="uma-nav-logo" aria-label="Uma Events home">
          {BRAND_NAME}
        </Link>

        <nav className="uma-nav-links" aria-label="Primary">
          {PUBLIC_NAV.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={cn("uma-nav-link", active && "is-active")}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="uma-nav-actions">
          <Link href="/contact" className="uma-nav-cta">
            Plan Your Event
          </Link>
          <button
            type="button"
            className="uma-nav-toggle"
            aria-expanded={open}
            aria-controls="uma-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="uma-mobile-nav"
            className="uma-nav-drawer"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <nav className="uma-nav-drawer-links">
              {PUBLIC_NAV.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={l.href} className="uma-nav-drawer-link" onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <Link href="/contact" className="uma-btn uma-btn-primary" onClick={() => setOpen(false)}>
              <span>Plan Your Event</span>
              <span className="uma-btn-arrow" aria-hidden>
                →
              </span>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
