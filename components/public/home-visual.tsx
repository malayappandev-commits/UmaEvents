"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CinematicBackdrop } from "@/components/public/cinematic-backdrop";
import { UmaButton } from "@/components/public/ui";
import { useParallax } from "@/components/public/motion";

export function HomeVisual({
  headline,
  sub,
  image,
  video,
  studio,
}: {
  headline: string;
  sub: string;
  image: string | null | undefined;
  video: string | null | undefined;
  studio: string;
}) {
  const reduce = useReducedMotion();
  const y = useParallax(22);
  const lines = headline.split("\n").length > 1 ? headline.split("\n") : headline.split(/(?<=\.)\s+/);

  return (
    <section className="uma-hero">
      <motion.div className="absolute inset-0 scale-[1.06]" style={reduce ? undefined : { y }}>
        <CinematicBackdrop video={video} image={image} />
      </motion.div>
      <div className="uma-hero-copy">
        <p className="uma-eyebrow uma-eyebrow--gold">
          {studio} · Vijayawada
        </p>
        <div className="uma-hero-title">
          {(lines.length ? lines : [headline]).map((line, i) => (
            <motion.h1
              key={line + i}
              initial={reduce ? false : { y: "108%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.05, delay: 0.18 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="uma-display"
            >
              {line}
            </motion.h1>
          ))}
        </div>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.7 }}
          className="uma-hero-sub"
        >
          {sub}
        </motion.p>
        <div className="uma-hero-actions">
          <UmaButton href="/contact" variant="primary">
            Plan Your Event
          </UmaButton>
          <UmaButton href="/services" variant="secondary">
            Explore Services
          </UmaButton>
        </div>
      </div>
    </section>
  );
}
