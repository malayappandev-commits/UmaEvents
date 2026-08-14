"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export const SERVICE_LOADER_KINDS = [
  "wedding",
  "birthday",
  "corporate",
  "kitty-party",
  "sangeet",
  "mehndi",
  "house-warming",
  "baby-shower",
] as const;

export type ServiceLoaderKind = (typeof SERVICE_LOADER_KINDS)[number];

export type ServiceLoaderDirection = "left" | "right" | "up" | "down" | "fade";

export type ServiceLoaderProps = {
  service: ServiceLoaderKind;
  illustration?: ReactNode;
  animationDirection?: ServiceLoaderDirection;
  loadingText?: string;
  duration?: number;
  onComplete?: () => void;
  active?: boolean;
  className?: string;
};

export const SERVICE_LOADER_COPY: Record<ServiceLoaderKind, string> = {
  wedding: "A celebration begins…",
  birthday: "Lighting the candles…",
  corporate: "Setting the room…",
  "kitty-party": "Gathering the circle…",
  sangeet: "The music finds its step…",
  mehndi: "Tracing the first motif…",
  "house-warming": "Crossing the threshold…",
  "baby-shower": "Welcoming new light…",
};

const OFFSET: Record<ServiceLoaderDirection, { x: number; y: number }> = {
  left: { x: -48, y: 0 },
  right: { x: 48, y: 0 },
  up: { x: 0, y: -36 },
  down: { x: 0, y: 36 },
  fade: { x: 0, y: 0 },
};

/**
 * Reusable service loading frame. Illustrations are passed in later;
 * this stage only establishes the API, copy, and motion shell.
 */
export function ServiceLoader({
  service,
  illustration,
  animationDirection = "fade",
  loadingText,
  duration = 1600,
  onComplete,
  active = true,
  className,
}: ServiceLoaderProps) {
  const reduce = useReducedMotion();
  const text = loadingText ?? SERVICE_LOADER_COPY[service];
  const from = OFFSET[animationDirection];

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => onComplete?.(), reduce ? 0 : duration);
    return () => window.clearTimeout(t);
  }, [active, duration, onComplete, reduce]);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className={cn("uma-service-loader", className)}
          data-service={service}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.45 }}
          role="status"
          aria-live="polite"
        >
          <div className="uma-service-loader-stage">
            <motion.div
              className="uma-service-loader-art"
              initial={reduce ? false : { opacity: 0, x: from.x, y: from.y }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {illustration ?? <ServiceLoaderPlaceholder service={service} />}
            </motion.div>
            <p className="uma-service-loader-label">{text}</p>
            <div className="uma-intro-progress uma-intro-progress--narrow" aria-hidden>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduce ? 0 : duration / 1000, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ServiceLoaderPlaceholder({ service }: { service: ServiceLoaderKind }) {
  return (
    <svg viewBox="0 0 120 88" className="uma-service-placeholder" aria-hidden>
      <rect x="8" y="12" width="104" height="64" rx="2" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M20 64 L48 36 L68 52 L84 28 L100 64" fill="none" stroke="currentColor" strokeOpacity="0.55" />
      <circle cx="84" cy="28" r="6" fill="none" stroke="currentColor" strokeOpacity="0.45" />
      <text x="60" y="78" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.5">
        {service.replace("-", " ")}
      </text>
    </svg>
  );
}
