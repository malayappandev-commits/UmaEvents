import type { Metadata } from "next";
import Link from "next/link";
import { getCoverMap, getEventTypes, getPublishedProjects, signMediaUrl } from "@/lib/queries/public";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events",
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
      covers[p.id] = await signMediaUrl(media?.thumbnail_url || media?.storage_path);
    }
  } catch {
    projects = [];
  }

  return (
    <main className="px-6 pb-24 pt-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Archive</p>
        <h1 className="mt-4 font-serif text-5xl md:text-7xl">Selected events</h1>
        {types.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/portfolio"
              className={`px-4 py-2 text-[11px] tracking-[0.2em] uppercase ${!type ? "bg-charcoal text-ivory" : "border border-charcoal/20"}`}
            >
              All
            </Link>
            {types.map((t) => (
              <Link
                key={t}
                href={`/portfolio?type=${encodeURIComponent(t)}`}
                className={`px-4 py-2 text-[11px] tracking-[0.2em] uppercase ${
                  type === t ? "bg-charcoal text-ivory" : "border border-charcoal/20"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        ) : null}

        {projects.length ? (
          <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {projects.map((p, i) => (
              <Link
                key={p.id}
                href={`/portfolio/${p.slug}`}
                className="group mb-4 block break-inside-avoid overflow-hidden bg-charcoal"
              >
                <div className={`relative ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}`}>
                  {covers[p.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={covers[p.id] || ""}
                      alt={p.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-earth/40 to-ink" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-90" />
                  <div className="absolute bottom-0 p-5 text-ivory">
                    <p className="text-[10px] tracking-[0.24em] text-gold uppercase">{p.event_type}</p>
                    <h2 className="mt-1 font-serif text-2xl">{p.title}</h2>
                    <p className="text-xs text-ivory/70">
                      {[p.location, formatDate(p.event_date)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-16 text-charcoal/60">No published events yet.</p>
        )}
      </div>
    </main>
  );
}
