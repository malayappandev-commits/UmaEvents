"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MagneticButton({
  children,
  className,
  href,
  type,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const inner = (
    <motion.span
      className="inline-flex items-center justify-center"
      animate={reduce ? undefined : { x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
    >
      {children}
    </motion.span>
  );

  const handlers = reduce
    ? {}
    : {
        onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({
            x: (e.clientX - rect.left - rect.width / 2) * 0.25,
            y: (e.clientY - rect.top - rect.height / 2) * 0.25,
          });
        },
        onMouseLeave: () => setPos({ x: 0, y: 0 }),
      };

  if (href) {
    return (
      <a href={href} className={cn("inline-flex", className)} {...handlers}>
        {inner}
      </a>
    );
  }

  return (
    <button type={type ?? "button"} className={cn("inline-flex", className)} onClick={onClick} {...handlers}>
      {inner}
    </button>
  );
}

export function useParallax(strength = 20) {
  const reduce = useReducedMotion();
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce]);
  return reduce ? 0 : offset * (strength / 600);
}
