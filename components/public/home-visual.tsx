"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { UmaButton } from "@/components/public/ui";
import { INTRO_DURATION_MS, INTRO_STORAGE_KEY } from "@/components/public/site-intro";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeVisual({
  headline,
  supporting,
}: {
  headline: string;
  supporting: string;
}) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(!!reduce);

  useEffect(() => {
    if (reduce) {
      setReady(true);
      return;
    }
    let delay = 60;
    try {
      if (sessionStorage.getItem(INTRO_STORAGE_KEY) !== "1") delay = INTRO_DURATION_MS + 80;
    } catch {
      /* private mode */
    }
    const timer = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 28]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const enter = (delay: number, y = 22) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: ready || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 1.15, delay: reduce ? 0 : delay, ease },
  });

  return (
    <section ref={sectionRef} className="uma-hero uma-hero--window uma-surface-dark">
      <motion.div
        className="uma-hero-copy uma-hero-copy--center"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.p className="uma-eyebrow uma-eyebrow--gold" {...enter(0.12, 12)}>
          Vijayawada · Event Management
        </motion.p>
        <motion.h1 className="uma-hero-statement" {...enter(0.32, 26)}>
          {headline}
        </motion.h1>
        <motion.p className="uma-hero-sub uma-hero-sub--center" {...enter(0.62, 16)}>
          {supporting}
        </motion.p>
        <motion.div className="uma-hero-actions uma-hero-actions--center" {...enter(0.92, 14)}>
          <UmaButton href="/contact" variant="primary">
            Plan Your Event
          </UmaButton>
          <UmaButton href="#reel" variant="secondary">
            Watch the reel
          </UmaButton>
        </motion.div>
      </motion.div>
      <motion.div className="uma-scroll-cue" aria-hidden="true" style={reduce ? undefined : { opacity: cueOpacity }}>
        <motion.div
          className="uma-scroll-cue-inner"
          initial={reduce ? false : { opacity: 0 }}
          animate={ready || reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: reduce ? 0 : 1.35, ease }}
        >
          <span className="uma-scroll-cue-line" />
          <span>Scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
