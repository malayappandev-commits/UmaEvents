"use client";

import { useRef } from "react";
import Link from "next/link";
import { HoverZoom, Reveal } from "@/components/public/motion";
import { Eyebrow, UmaButton } from "@/components/public/ui";

export type ReelFrame = {
  id: string;
  title: string;
  slug: string;
  eventType: string;
  coverUrl: string | null;
};

export function EventReel({ frames }: { frames: ReelFrame[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.72, 420), behavior: "smooth" });
  };

  return (
    <section className="uma-chapter uma-chapter--ink">
      <div className="uma-chapter-inner">
        <Reveal className="uma-chapter-head uma-chapter-head--center">
          <Eyebrow className="uma-eyebrow--gold">The reel</Eyebrow>
          <h2 className="uma-section-title">A glimpse of recent work</h2>
        </Reveal>

        {frames.length ? (
          <>
            <div className="uma-reel-toolbar">
              <button type="button" className="uma-reel-arrow" onClick={() => scrollBy(-1)} aria-label="Previous events">
                ←
              </button>
              <button type="button" className="uma-reel-arrow" onClick={() => scrollBy(1)} aria-label="Next events">
                →
              </button>
            </div>
            <div ref={scroller} className="uma-reel">
              {frames.map((frame, i) => (
                <Link key={frame.id} href={`/portfolio/${frame.slug}`} className="uma-reel-frame">
                  <HoverZoom className="uma-reel-media">
                    {frame.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={frame.coverUrl} alt={frame.title} />
                    ) : (
                      <div className="uma-reel-fallback" />
                    )}
                  </HoverZoom>
                  <div className="uma-reel-cap">
                    <p className="uma-reel-num">{String(i + 1).padStart(2, "0")}</p>
                    <p className="uma-reel-type">{frame.eventType}</p>
                    <h3>{frame.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <p className="uma-reel-hint">Drag to explore</p>
          </>
        ) : (
          <p className="uma-empty uma-empty--on-ink">Moments we&apos;re proud to share will appear here.</p>
        )}

        <div className="uma-chapter-foot">
          <UmaButton href="/portfolio" variant="secondary">
            View Gallery
          </UmaButton>
        </div>
      </div>
    </section>
  );
}
