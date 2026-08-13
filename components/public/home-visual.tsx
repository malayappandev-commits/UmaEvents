"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MagneticButton, useParallax } from "@/components/public/motion";

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
  const y = useParallax(28);
  const lines = headline.split("\n").length > 1 ? headline.split("\n") : headline.split(/(?<=\.)\s+/);

  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-ivory">
      <motion.div
        className="absolute inset-0 scale-110"
        style={reduce ? undefined : { y }}
      >
        {video ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={image || undefined}
          >
            <source src={video} />
          </video>
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_#3a3228,_#0c0b0a_62%)]" />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/25 to-ink/80" />
      <div className="noise-overlay" />
      <div className="relative flex h-full flex-col justify-end px-6 pb-20 md:px-16 md:pb-24">
        <p className="text-[11px] tracking-[0.4em] text-gold uppercase">{studio} · Vijayawada</p>
        <div className="mt-6 max-w-5xl overflow-hidden">
          {(lines.length ? lines : [headline]).map((line, i) => (
            <motion.h1
              key={line + i}
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-5xl leading-[0.95] md:text-7xl lg:text-8xl"
            >
              {line}
            </motion.h1>
          ))}
        </div>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-6 max-w-xl text-base text-ivory/75 md:text-lg"
        >
          {sub}
        </motion.p>
        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton
            href="/portfolio"
            className="border border-gold bg-gold/10 px-6 py-3 text-[11px] tracking-[0.28em] uppercase"
          >
            Selected events
          </MagneticButton>
          <MagneticButton
            href="/contact"
            className="border border-ivory/30 px-6 py-3 text-[11px] tracking-[0.28em] uppercase"
          >
            Plan a gathering
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
