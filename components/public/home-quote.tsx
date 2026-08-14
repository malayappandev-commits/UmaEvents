"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CinematicBackdrop } from "@/components/public/cinematic-backdrop";
import { GoldLineReveal, Reveal } from "@/components/public/motion";

export function HomeQuote({
  text,
  eyebrow,
  image,
}: {
  text: string;
  eyebrow?: string;
  image: string | null;
}) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.06]);

  return (
    <section ref={sectionRef} className="uma-quote-band">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: bgScale }}>
        <CinematicBackdrop image={image} overlay="quote" />
      </motion.div>
      <Reveal className="uma-quote-band-inner" duration={0.95}>
        {eyebrow ? <p className="uma-eyebrow uma-eyebrow--gold">{eyebrow}</p> : null}
        <blockquote className="uma-quote uma-quote--ivory">{text}</blockquote>
        <GoldLineReveal className="mx-auto mt-10 max-w-[7rem]" delay={0.18} />
      </Reveal>
    </section>
  );
}
