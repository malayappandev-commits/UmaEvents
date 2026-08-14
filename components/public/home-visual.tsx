"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CinematicBackdrop } from "@/components/public/cinematic-backdrop";
import { UmaButton } from "@/components/public/ui";
import { INTRO_DURATION_MS, INTRO_STORAGE_KEY } from "@/components/public/site-intro";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/public/nav";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeVisual({
  line,
  supporting,
  image,
  video,
}: {
  line: string;
  supporting: string;
  image: string | null | undefined;
  video: string | null | undefined;
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

  const contentY = useTransform(scrollYProgress, [0, 0.55], [0, 36]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.42], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.985]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.08]);
  const shadeOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 0.42]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const enter = (delay: number, y = 28) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: ready || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 0.95, delay: reduce ? 0 : delay, ease },
  });

  return (
    <section ref={sectionRef} className="uma-hero">
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { scale: bgScale }}
      >
        <CinematicBackdrop video={video} image={image} overlay="hero" eager />
      </motion.div>
      <motion.div
        className="uma-hero-veil"
        aria-hidden
        initial={false}
        animate={{ opacity: reduce ? 0.18 : ready ? 0.12 : 0.55 }}
        transition={{ duration: reduce ? 0 : 1.8, ease }}
      />
      {reduce ? null : <motion.div className="uma-hero-shade" style={{ opacity: shadeOpacity }} aria-hidden />}
      <motion.div
        className="uma-hero-copy uma-hero-copy--center"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity, scale: contentScale }}
      >
        <motion.p className="uma-eyebrow uma-eyebrow--gold" {...enter(0.05, 12)}>
          Vijayawada · Event Management
        </motion.p>
        <div className="uma-hero-title uma-hero-title--center">
          <motion.h1 className="uma-display uma-hero-brand" {...enter(0.28, 30)}>
            {BRAND_NAME}
          </motion.h1>
        </div>
        <motion.p className="uma-hero-line" {...enter(0.55, 22)}>
          {line || BRAND_TAGLINE}
        </motion.p>
        <motion.p className="uma-hero-sub uma-hero-sub--center" {...enter(0.78, 18)}>
          {supporting}
        </motion.p>
        <motion.div className="uma-hero-actions uma-hero-actions--center" {...enter(1.02, 16)}>
          <UmaButton href="/services" variant="secondary">
            Explore Services
          </UmaButton>
          <UmaButton href="/contact" variant="primary">
            Plan Your Event
          </UmaButton>
        </motion.div>
      </motion.div>
      <motion.div className="uma-scroll-cue" aria-hidden="true" style={reduce ? undefined : { opacity: cueOpacity }}>
        <motion.div
          className="uma-scroll-cue-inner"
          initial={reduce ? false : { opacity: 0 }}
          animate={ready || reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.9, delay: reduce ? 0 : 1.45, ease }}
        >
          <span className="uma-scroll-cue-line" />
          <span>Scroll to explore</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
