"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CinematicBackdrop } from "@/components/public/cinematic-backdrop";

/** Single ambient film layer for the homepage — never a second video. */
export function AmbientFilm({
  video,
  image,
}: {
  video?: string | null;
  image?: string | null;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="uma-ambient" aria-hidden>
      <motion.div
        className="uma-ambient-inner"
        initial={false}
        animate={reduce ? undefined : { scale: [1, 1.06] }}
        transition={reduce ? undefined : { duration: 28, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <CinematicBackdrop video={video} image={image} overlay="ambient" eager />
      </motion.div>
      <div className="uma-ambient-wash" />
    </div>
  );
}
