"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { UmaButton } from "@/components/public/ui";
import type { CraftedService } from "@/lib/public/service-visuals";

export function ServicePortrait({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial={false}
      whileHover={reduce ? undefined : { y: -4, scale: 1.03 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" role="presentation" data-service={title} />
    </motion.span>
  );
}

export function ServiceActions({ slug }: { slug: string }) {
  return (
    <div className="uma-service-actions">
      <Link href={`/services#${slug}`} className="uma-service-explore">
        Explore service
      </Link>
      <UmaButton href="/contact" variant="secondary">
        Plan Your Event
      </UmaButton>
    </div>
  );
}
