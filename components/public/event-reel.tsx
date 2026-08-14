"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { HoverZoom, Reveal } from "@/components/public/motion";
import { Eyebrow } from "@/components/public/ui";

export type ReelFrame = {
  id: string;
  title: string;
  href: string;
  eventType?: string | null;
  coverUrl: string;
};

export function EventReel({ frames }: { frames: ReelFrame[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let moved = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      dragging = true;
      moved = 0;
      startX = event.clientX;
      startLeft = el.scrollLeft;
      el.classList.add("is-dragging");
      el.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      el.scrollLeft = startLeft - dx;
    };

    const stop = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    };

    const onClickCapture = (event: MouseEvent) => {
      if (moved > 6) {
        event.preventDefault();
        event.stopPropagation();
        moved = 0;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointercancel", stop);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", stop);
      el.removeEventListener("pointercancel", stop);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, [frames.length]);

  return (
    <section id="reel" className="uma-filmstrip-section uma-surface-dark">
      <Reveal className="uma-filmstrip-head">
        <Eyebrow className="uma-eyebrow--gold">The Reel</Eyebrow>
        <h2>A glimpse of recent work</h2>
      </Reveal>

      <div ref={scroller} className="uma-reel" tabIndex={0} aria-label="Event filmstrip">
        {frames.map((frame, i) => (
          <Link key={frame.id} href={frame.href} className="uma-reel-frame">
            <HoverZoom className="uma-reel-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame.coverUrl} alt={frame.title} loading="lazy" decoding="async" />
            </HoverZoom>
            <div className="uma-reel-cap">
              <p className="uma-reel-num">{String(i + 1).padStart(2, "0")}</p>
              {frame.eventType ? <p className="uma-reel-type">{frame.eventType}</p> : null}
              {frame.title ? <h3>{frame.title}</h3> : null}
            </div>
          </Link>
        ))}
      </div>
      <p className="uma-reel-hint">
        Drag to explore · <Link href="/portfolio">see full gallery →</Link>
      </p>
    </section>
  );
}
