"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable cinematic media layer. Video/image URLs come from existing
 * studio_settings (hero_video_url / hero_image_url) — never hardcoded stock.
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
  return (
    <div className={cn("uma-cinematic-stage", className)}>
      {video ? (
        <video
          className="uma-cinematic-media"
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
        <img
          src={image}
          alt={alt}
          className="uma-cinematic-media"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <div className="uma-cinematic-fallback" />
      )}
      <div className={cn("uma-cinematic-overlay", overlay !== "default" && `uma-cinematic-overlay--${overlay}`)} />
      <div className="noise-overlay" />
      {children}
    </div>
  );
}
