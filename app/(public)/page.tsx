import Link from "next/link";
import { getCoverMap, getPublishedProjects, getPublishedServices, getSettings, signMediaUrl } from "@/lib/queries/public";
import { jsonLdLocalBusiness } from "@/lib/seo";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { HomeVisual } from "@/components/public/home-visual";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  let settings = null;
  let services: Awaited<ReturnType<typeof getPublishedServices>> = [];
  let projects: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  let featured: typeof projects = [];
  const covers: Record<string, string | null> = {};

  try {
    settings = await getSettings();
    services = await getPublishedServices();
    projects = await getPublishedProjects();
    featured = projects.filter((p) => p.featured).slice(0, 5);
    if (!featured.length) featured = projects.slice(0, 5);
    const map = await getCoverMap(featured);
    for (const p of featured) {
      const media = p.cover_media_id ? map.get(p.cover_media_id) : null;
      covers[p.id] = await signMediaUrl(media?.thumbnail_url || media?.storage_path || media?.public_url);
    }
  } catch {
    /* Supabase not configured yet */
  }

  const categories = Array.from(
    new Set([
      ...services.map((s) => s.category).filter(Boolean),
      ...projects.map((p) => p.event_type).filter(Boolean),
    ]),
  );

  const gallery = featured.slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness(settings)) }}
      />
      <HomeVisual
        headline={settings?.hero_headline || "We create moments worth remembering."}
        sub={settings?.hero_subheadline || "Event management and planning from Vijayawada."}
        image={settings?.hero_image_url}
        video={settings?.hero_video_url}
        studio={settings?.studio_name || "Uma Events"}
      />

      <section className="relative overflow-hidden bg-ivory px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-7xl items-end gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Uma Events</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-charcoal md:text-6xl">
              Gatherings, held with care.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="text-lg leading-relaxed text-charcoal/75">
              {settings?.about_intro ||
                "Uma Events is an event management and event planning studio based in Vijayawada, Andhra Pradesh. The work is to shape atmosphere — space, sequence, and the details that make a day feel considered."}
            </p>
            <Link href="/about" className="mt-8 inline-block text-[11px] tracking-[0.28em] text-earth uppercase">
              The studio →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-charcoal px-6 py-24 text-ivory md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.32em] text-gold uppercase">What we do</p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">Signature services</h2>
            </div>
            <Link href="/services" className="hidden text-[11px] tracking-[0.28em] uppercase text-gold md:block">
              All services
            </Link>
          </div>
          {services.length ? (
            <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-3">
              {services.slice(0, 6).map((s) => (
                <article key={s.id} className="bg-charcoal p-8 transition hover:bg-ink">
                  <p className="text-[10px] tracking-[0.28em] text-gold/80 uppercase">{s.category}</p>
                  <h3 className="mt-4 font-serif text-3xl">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/60">{s.short_description}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-12 max-w-xl text-ivory/60">
              Services are published from the studio. When they are ready, they will appear here.
            </p>
          )}
        </div>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Archive</p>
          <h2 className="mt-3 font-serif text-4xl md:text-6xl">Selected events</h2>
          {featured.length ? (
            <div className="mt-14 grid gap-4 md:grid-cols-12">
              {featured.map((p, i) => {
                const span =
                  i === 0 ? "md:col-span-8 md:row-span-2 min-h-[420px]" : i === 1 ? "md:col-span-4 min-h-[280px]" : "md:col-span-4 min-h-[240px]";
                return (
                  <Link
                    key={p.id}
                    href={`/portfolio/${p.slug}`}
                    className={`group relative overflow-hidden bg-charcoal ${span}`}
                  >
                    {covers[p.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={covers[p.id] || ""}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-charcoal to-earth/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                    <div className="absolute bottom-0 p-6 text-ivory">
                      <p className="text-[10px] tracking-[0.28em] uppercase text-gold">{p.event_type}</p>
                      <h3 className="mt-2 font-serif text-3xl">{p.title}</h3>
                      <p className="mt-1 text-sm text-ivory/70">
                        {[p.location, formatDate(p.event_date)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-10 max-w-lg text-charcoal/60">
              Published events will appear here once they are added in the studio.
            </p>
          )}
          <Link href="/portfolio" className="mt-10 inline-block text-[11px] tracking-[0.28em] text-earth uppercase">
            View the archive →
          </Link>
        </div>
      </section>

      {categories.length ? (
        <section className="border-y border-charcoal/10 bg-cream/50 px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Explore</p>
            <h2 className="mt-3 font-serif text-4xl">Event categories</h2>
            <div className="mt-10 flex flex-wrap gap-3">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/portfolio?type=${encodeURIComponent(c)}`}
                  className="border border-charcoal/20 px-5 py-3 text-[11px] tracking-[0.22em] uppercase transition hover:border-gold hover:text-earth"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2">
          <div>
            <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Approach</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Why Uma Events</h2>
          </div>
          <ul className="space-y-8 text-charcoal/80">
            <li>
              <p className="font-serif text-2xl">Presence in Vijayawada</p>
              <p className="mt-2 text-sm leading-relaxed">
                The studio is based in Vijayawada, Andhra Pradesh — close to the venues, vendors, and
                rhythms of the region.
              </p>
            </li>
            <li>
              <p className="font-serif text-2xl">Planning and production</p>
              <p className="mt-2 text-sm leading-relaxed">
                Uma Events handles event management as a whole: the plan, the space, and the day itself.
              </p>
            </li>
            <li>
              <p className="font-serif text-2xl">A considered process</p>
              <p className="mt-2 text-sm leading-relaxed">
                Conversations first. Then a clear path from brief to celebration — without forcing a
                packaged formula.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {gallery.length ? (
        <section className="overflow-hidden bg-ink py-8">
          <div className="flex gap-3 overflow-x-auto px-6 pb-4">
            {gallery.map((p) => (
              <Link key={p.id} href={`/portfolio/${p.slug}`} className="relative h-56 w-80 shrink-0 overflow-hidden">
                {covers[p.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={covers[p.id] || ""} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-earth/30" />
                )}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-cream px-6 py-24 md:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Begin</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Tell us about the day</h2>
          <p className="mt-4 text-charcoal/70">
            Share a few details. There are no packages to choose from — every gathering is planned on
            its own terms.
          </p>
          <div className="mt-10">
            <EnquiryForm eventTypes={categories} />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Visit</p>
            <p className="mt-2 font-serif text-3xl">{settings?.address || "Vijayawada, Andhra Pradesh"}</p>
          </div>
          <Link href="/contact" className="text-[11px] tracking-[0.28em] uppercase text-earth">
            Contact →
          </Link>
        </div>
      </section>
    </>
  );
}
