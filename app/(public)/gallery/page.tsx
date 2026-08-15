import type { Metadata } from "next";
import {
  getCoverMap,
  getPublishedGalleryMedia,
  getPublishedProjects,
  publicAssetUrl,
  signMediaUrl,
} from "@/lib/queries/public";
import { EmptyState } from "@/components/public/empty-state";
import { formatDate, isPublicLiveUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Latest events and remarkable milestones from Uma Events.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  let latest: Awaited<ReturnType<typeof getPublishedGalleryMedia>> = [];
  let milestones: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  const covers: Record<string, string | null> = {};

  try {
    latest = await getPublishedGalleryMedia();
    milestones = await getPublishedProjects({ milestones: true });
    const map = await getCoverMap(milestones);
    for (const p of milestones) {
      const media = p.cover_media_id ? map.get(p.cover_media_id) : null;
      covers[p.id] = await signMediaUrl(media?.thumbnail_url || media?.storage_path || media?.public_url);
    }
  } catch {
    latest = [];
    milestones = [];
  }

  return (
    <main className="px-6 pb-24 pt-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Gallery</p>
        <h1 className="mt-4 font-serif text-5xl md:text-7xl">Latest events</h1>
        {latest.length ? (
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((item) => {
              const src = publicAssetUrl(item.public_url || item.storage_path);
              return (
                <figure key={item.id} className="aspect-square overflow-hidden bg-cream">
                  {item.type === "VIDEO" && src ? (
                    <video src={src} controls className="h-full w-full object-cover" />
                  ) : src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={item.title || item.filename} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-sm text-charcoal/50">
                      {item.title || "Media"}
                    </div>
                  )}
                  {item.title ? (
                    <figcaption className="sr-only">
                      {item.title}
                      {item.event_date ? ` · ${formatDate(item.event_date)}` : ""}
                    </figcaption>
                  ) : null}
                </figure>
              );
            })}
          </div>
        ) : (
          <EmptyState>Latest event media will appear here once it is uploaded and published.</EmptyState>
        )}

        <section className="mt-24">
          <h2 className="font-serif text-4xl md:text-5xl">Remarkable milestones</h2>
          {milestones.length ? (
            <div className="mt-12 space-y-16">
              {milestones.map((event, index) => {
                const slides = (
                  <div className="aspect-square overflow-hidden bg-cream">
                    {covers[event.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={covers[event.id] || ""} alt={event.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                );
                const copy = (
                  <div>
                    <p className="text-[11px] tracking-[0.28em] text-earth uppercase">{event.event_type}</p>
                    <h3 className="mt-3 font-serif text-3xl">{event.title}</h3>
                    <p className="mt-2 text-sm text-charcoal/60">
                      {[event.location, formatDate(event.event_date)].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-6 whitespace-pre-wrap leading-7 text-charcoal/80">
                      {event.milestone_description || event.description || "A milestone gathering produced by Uma Events."}
                    </p>
                    {isPublicLiveUrl(event.live_url) ? (
                      <a
                        href={event.live_url!}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 inline-block text-[11px] tracking-[0.22em] uppercase text-earth"
                      >
                        Watch live
                      </a>
                    ) : null}
                  </div>
                );
                return (
                  <article
                    key={event.id}
                    className="grid items-center gap-10 md:grid-cols-2"
                  >
                    {index % 2 === 0 ? (
                      <>
                        {slides}
                        {copy}
                      </>
                    ) : (
                      <>
                        {copy}
                        {slides}
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState>Remarkable milestones will appear here once selected events are published as milestones.</EmptyState>
          )}
        </section>
      </div>
    </main>
  );
}
