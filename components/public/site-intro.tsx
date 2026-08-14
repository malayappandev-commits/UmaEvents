"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/public/nav";

const STORAGE_KEY = "uma.intro.seen";

export function SiteIntro() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduce) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    setVisible(true);
    const done = window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 2400);
    return () => window.clearTimeout(done);
  }, [reduce]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="uma-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-label="Uma Events"
        >
          <div className="uma-intro-glow" aria-hidden />
          <div className="noise-overlay" />
          <motion.p
            className="uma-intro-mark"
            initial={{ opacity: 0, letterSpacing: "0.55em" }}
            animate={{ opacity: 1, letterSpacing: "0.38em" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {BRAND_NAME}
          </motion.p>
          <motion.p
            className="uma-intro-line"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
          >
            {BRAND_TAGLINE}
          </motion.p>
          <div className="uma-intro-progress" aria-hidden>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <motion.div
            className="uma-intro-sweep"
            initial={{ x: "-120%", opacity: 0 }}
            animate={{ x: "120%", opacity: [0, 0.55, 0] }}
            transition={{ duration: 1.6, delay: 0.35, ease: "easeInOut" }}
            aria-hidden
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
