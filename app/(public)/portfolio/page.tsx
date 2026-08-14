import type { Metadata } from "next";
import Link from "next/link";
import { getCoverMap, getEventTypes, getPublishedProjects, signMediaUrl } from "@/lib/queries/public";
import { PageBanner } from "@/components/public/page-banner";
import { EventReel } from "@/components/public/event-reel";
import { CineMosaic } from "@/components/public/cine-mosaic";
import { Reveal } from "@/components/public/motion";
import { UmaButton } from "@/components/public/ui";
import { formatDate } from "@/lib/utils";
import { DESIGN_STILLS } from "@/lib/public/design-visuals";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Selected events produced by Uma Events in Vijayawada.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  let projects: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  let types: string[] = [];
  const covers: Record<string, string | null> = {};

  try {
    types = await getEventTypes();
    projects = await getPublishedProjects({ eventType: type || undefined });
    const map = await getCoverMap(projects);
    for (const p of projects) {
      const media = p.cover_media_id ? map.get(p.cover_media_id) : null;
      covers[p.id] = await signMediaUrl(media?.thumbnail_url || media?.storage_path || media?.public_url);
    }
  } catch {
    projects = [];
  }

  const cmsFrames = projects
    .map((p) => {
      const src = covers[p.id];
      if (!src) return null;
      return {
        id: p.id,
        title: p.title,
        href: `/portfolio/${p.slug}`,
        eventType: p.event_type,
        coverUrl: src,
        meta: [p.location, formatDate(p.event_date)].filter(Boolean).join(" · "),
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    title: string;
    href: string;
    eventType: string;
    coverUrl: string;
    meta: string;
  }>;

  const usingCms = cmsFrames.length > 0;
  const reel = usingCms
    ? cmsFrames
    : DESIGN_STILLS.map((still, i) => ({
        id: `visual-${i}`,
        title: still.label,
        href: "/contact",
        eventType: null,
        coverUrl: still.src,
      }));

  const mosaic = usingCms
    ? cmsFrames.map((f) => ({ id: f.id, src: f.coverUrl, title: f.title, meta: f.meta, href: f.href }))
    : DESIGN_STILLS.map((still, i) => ({
        id: `mosaic-${i}`,
        src: still.src,
        title: still.label,
      }));

  return (
    <main className="uma-cine-page">
      <PageBanner
        eyebrow="Gallery"
        title="A glimpse of recent work"
        copy={
          usingCms
            ? "Selected celebrations composed by Uma Events."
            : "Event photography that sets the visual language of the studio. Published events appear here when they are marked live."
        }
        image={reel[0]?.coverUrl || DESIGN_STILLS[0].src}
      />

      {types.length ? (
        <div className="uma-filter-row uma-surface-dark">
          <Link href="/portfolio" className={!type ? "is-active" : undefined}>
            All
          </Link>
          {types.map((t) => (
            <Link key={t} href={`/portfolio?type=${encodeURIComponent(t)}`} className={type === t ? "is-active" : undefined}>
              {t}
            </Link>
          ))}
        </div>
      ) : null}

      <EventReel frames={reel} headed={false} />

      <section className="uma-mosaic-section uma-surface-dark">
        <Reveal className="uma-filmstrip-head">
          <h2>Frames from the floor</h2>
        </Reveal>
        <CineMosaic frames={mosaic} />
        {!usingCms ? (
          <p className="uma-reel-hint">These stills are design-target photography, not published CMS projects.</p>
        ) : null}
        <div className="uma-chapter-foot">
          <UmaButton href="/contact" variant="primary">
            Plan Your Event
          </UmaButton>
        </div>
      </section>
    </main>
  );
}
