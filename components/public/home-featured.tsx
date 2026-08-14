import Link from "next/link";
import type { Project } from "@/types";
import { Reveal, HoverZoom } from "@/components/public/motion";
import { Eyebrow, UmaButton } from "@/components/public/ui";
import { formatDate, optionalHttpUrl } from "@/lib/utils";

export function HomeFeatured({
  events,
  covers,
}: {
  events: Project[];
  covers: Record<string, string | null>;
}) {
  if (!events.length) return null;
  const event = events[0];
  const live = optionalHttpUrl(
    (event as Project & { live_stream_url?: unknown; livestream_url?: unknown }).live_stream_url ??
      (event as Project & { livestream_url?: unknown }).livestream_url,
  );

  return (
    <section className="uma-featured-cine uma-surface-dark">
      <Reveal>
        <article className="uma-featured-story">
          {covers[event.id] ? (
            <div className="uma-featured-story-media">
              <HoverZoom className="h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={covers[event.id] || ""}
                  alt={event.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </HoverZoom>
            </div>
          ) : null}
          <div className="uma-featured-story-copy">
            <Eyebrow className="uma-eyebrow--gold">{event.event_type || "Featured"}</Eyebrow>
            <h2 className="uma-featured-title">{event.title}</h2>
            <p className="uma-featured-meta">
              {[event.location, formatDate(event.event_date)].filter(Boolean).join(" · ")}
            </p>
            {event.description ? <p className="uma-featured-desc">{event.description}</p> : null}
            <div className="uma-featured-actions">
              <UmaButton href={`/portfolio/${event.slug}`} variant="primary">
                View Event
              </UmaButton>
              {live ? (
                <a href={live} className="uma-btn uma-btn-secondary" target="_blank" rel="noreferrer">
                  <span>Watch live</span>
                  <span className="uma-btn-arrow" aria-hidden>
                    →
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        </article>
      </Reveal>
      {events.length > 1 ? (
        <p className="uma-cine-more">
          <Link href="/portfolio">More from the gallery →</Link>
        </p>
      ) : null}
    </section>
  );
}
