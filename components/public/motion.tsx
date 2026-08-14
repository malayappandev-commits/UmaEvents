"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.85,
  y = 30,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function FadeReveal({
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
      initial={reduce ? false : { opacity: 0 }}
      whileInView={reduce ? undefined : { opacity: 1 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function SlideReveal({
  children,
  className,
  delay = 0,
  from = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "up" | "down" | "left" | "right";
}) {
  const reduce = useReducedMotion();
  const offset = { up: { y: 32 }, down: { y: -24 }, left: { x: 36 }, right: { x: -36 } }[from];
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, ...offset }}
      whileInView={reduce ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function ImageReveal({
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
      className={cn("overflow-hidden", className)}
      initial={reduce ? false : { opacity: 0, scale: 1.04, filter: "blur(10px)" }}
      whileInView={reduce ? undefined : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function TextReveal({
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
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        initial={reduce ? false : { y: "110%" }}
        whileInView={reduce ? undefined : { y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, delay, ease }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function GoldLineReveal({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("uma-gold-line", className)}
      initial={reduce ? false : { scaleX: 0, opacity: 0 }}
      whileInView={reduce ? undefined : { scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease }}
      style={{ transformOrigin: "center" }}
      role="presentation"
    />
  );
}

export function HoverZoom({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("uma-hover-zoom", className)}>{children}</div>;
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
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
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
            x: (e.clientX - rect.left - rect.width / 2) * 0.18,
            y: (e.clientY - rect.top - rect.height / 2) * 0.18,
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
