"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DESIGN_HERO_POSTER } from "@/lib/public/design-visuals";

/**
 * Cinematic media layer. Prefers CMS URLs; falls back to supplied event stills,
 * never abstract placeholder art.
 */
export function CinematicBackdrop({
  video,
  image,
  alt = "",
  className,
  overlay = "default",
  children,
  eager = false,
}: {
  video?: string | null;
  image?: string | null;
  alt?: string;
  className?: string;
  overlay?: "default" | "hero" | "quote" | "ambient";
  children?: ReactNode;
  eager?: boolean;
}) {
  const still = image || DESIGN_HERO_POSTER;

  return (
    <div className={cn("uma-cinematic-stage", className)}>
      {video ? (
        <video
          className="uma-cinematic-media"
          autoPlay
          muted
          loop
          playsInline
          poster={still}
        >
          <source src={video} />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={still}
          alt={alt}
          className="uma-cinematic-media"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      <div className={cn("uma-cinematic-overlay", overlay !== "default" && `uma-cinematic-overlay--${overlay}`)} />
      <div className="noise-overlay" />
      {children}
    </div>
  );
}
