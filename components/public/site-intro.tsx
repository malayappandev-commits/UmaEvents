"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/public/nav";

export const INTRO_STORAGE_KEY = "uma.intro.seen";
export const INTRO_DURATION_MS = 1800;

export function SiteIntro() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduce || pathname !== "/") return;
    try {
      if (sessionStorage.getItem(INTRO_STORAGE_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    setVisible(true);
    const done = window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, INTRO_DURATION_MS);
    return () => window.clearTimeout(done);
  }, [pathname, reduce]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="uma-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-label="Welcome to Uma Events"
        >
          <div className="uma-intro-glow" aria-hidden />
          <div className="noise-overlay" />
          <motion.div
            className="uma-intro-walker"
            initial={{ x: "-46vw" }}
            animate={{ x: "22vw" }}
            transition={{ duration: 1.55, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/visual/services/wedding.webp" alt="" />
          </motion.div>
          <motion.p
            className="uma-intro-mark"
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.38em" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {BRAND_NAME}
          </motion.p>
          <motion.p
            className="uma-intro-line"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.55 }}
          >
            {BRAND_TAGLINE}
          </motion.p>
          <div className="uma-intro-progress" aria-hidden>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
