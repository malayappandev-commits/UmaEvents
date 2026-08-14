"use client";

import { CinematicBackdrop } from "@/components/public/cinematic-backdrop";
import { GoldLineReveal, Reveal } from "@/components/public/motion";
import { useParallax } from "@/components/public/motion";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";

export function HomeQuote({
  text,
  image,
}: {
  text: string;
  image: string | null;
}) {
  const reduce = useReducedMotion();
  const y = useParallax(14);

  return (
    <section className="uma-quote-band">
      <motion.div className="absolute inset-0 scale-[1.06]" style={reduce ? undefined : { y }}>
        <CinematicBackdrop image={image} overlay="quote" />
      </motion.div>
      <Reveal className="uma-quote-band-inner">
        <GoldLineReveal className="mx-auto max-w-[8rem]" />
        <blockquote className="uma-quote uma-quote--ivory">{text}</blockquote>
        <p className="uma-quote-attrib">Uma Events</p>
      </Reveal>
    </section>
  );
}
