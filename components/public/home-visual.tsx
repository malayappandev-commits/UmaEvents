"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CinematicBackdrop } from "@/components/public/cinematic-backdrop";
import { UmaButton } from "@/components/public/ui";
import { useParallax } from "@/components/public/motion";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/public/nav";

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
  const y = useParallax(18);

  return (
    <section className="uma-hero">
      <motion.div className="absolute inset-0 scale-[1.05]" style={reduce ? undefined : { y }}>
        <CinematicBackdrop video={video} image={image} overlay="hero" />
      </motion.div>
      <div className="uma-hero-copy uma-hero-copy--center">
        <motion.p
          className="uma-eyebrow uma-eyebrow--gold"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Vijayawada · Event Management
        </motion.p>
        <div className="uma-hero-title uma-hero-title--center">
          <motion.h1
            initial={reduce ? false : { y: "108%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="uma-display uma-hero-brand"
          >
            {BRAND_NAME}
          </motion.h1>
        </div>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.75 }}
          className="uma-hero-line"
        >
          {line || BRAND_TAGLINE}
        </motion.p>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="uma-hero-sub uma-hero-sub--center"
        >
          {supporting}
        </motion.p>
        <motion.div
          className="uma-hero-actions uma-hero-actions--center"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.65 }}
        >
          <UmaButton href="/services" variant="secondary">
            Explore Services
          </UmaButton>
          <UmaButton href="/contact" variant="primary">
            Plan Your Event
          </UmaButton>
        </motion.div>
      </div>
      <div className="uma-scroll-cue" aria-hidden="true">
        <span className="uma-scroll-cue-line" />
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}
