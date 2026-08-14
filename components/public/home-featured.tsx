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

  return (
    <section className="uma-chapter uma-chapter--ink">
      <div className="uma-chapter-inner">
        <Reveal className="uma-chapter-head">
          <Eyebrow className="uma-eyebrow--gold">Featured</Eyebrow>
          <h2 className="uma-section-title">Events in focus</h2>
        </Reveal>
        <div className="uma-featured-list">
          {events.map((event, i) => {
            const live = optionalHttpUrl(
              (event as Project & { live_stream_url?: unknown; livestream_url?: unknown }).live_stream_url ??
                (event as Project & { livestream_url?: unknown }).livestream_url,
            );
            return (
              <Reveal key={event.id} delay={i * 0.06}>
                <article className="uma-featured">
                  <Link href={`/portfolio/${event.slug}`} className="uma-featured-media">
                    <HoverZoom className="h-full w-full">
                      {covers[event.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={covers[event.id] || ""}
                          alt={event.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="uma-reel-fallback h-full" />
                      )}
                    </HoverZoom>
                  </Link>
                  <div className="uma-featured-copy">
                    {event.event_type ? <Eyebrow className="uma-eyebrow--gold">{event.event_type}</Eyebrow> : null}
                    <h3 className="uma-featured-title">{event.title}</h3>
                    <p className="uma-featured-meta">
                      {[event.location, formatDate(event.event_date)].filter(Boolean).join(" · ")}
                    </p>
                    {event.description ? <p className="uma-featured-desc">{event.description}</p> : null}
                    <div className="uma-featured-actions">
                      <UmaButton href={`/portfolio/${event.slug}`} variant="secondary">
                        View Event
                      </UmaButton>
                      {live ? (
                        <a href={live} className="uma-btn uma-btn-primary" target="_blank" rel="noreferrer">
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
