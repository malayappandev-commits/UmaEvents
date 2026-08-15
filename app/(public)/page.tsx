import Link from "next/link";
import {
  getCoverMap,
  getPublishedProjects,
  getPublishedServices,
  getPublishedSiteRatings,
  getPublishedTestimonials,
  getPublishedWhyChooseUs,
  getSettings,
  signMediaUrl,
} from "@/lib/queries/public";
import { jsonLdLocalBusiness } from "@/lib/seo";
import { HomeVisual } from "@/components/public/home-visual";
import { ContactSection } from "@/components/public/contact-section";
import { EmptyState } from "@/components/public/empty-state";
import { ServiceCard } from "@/components/public/service-card";
import { formatDate, isPublicLiveUrl } from "@/lib/utils";

export default async function HomePage() {
  let settings = null;
  let services: Awaited<ReturnType<typeof getPublishedServices>> = [];
  let featured: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  let ratings: Awaited<ReturnType<typeof getPublishedSiteRatings>> = [];
  let whyChoose: Awaited<ReturnType<typeof getPublishedWhyChooseUs>> = [];
  let testimonials: Awaited<ReturnType<typeof getPublishedTestimonials>> = [];
  const covers: Record<string, string | null> = {};

  try {
    settings = await getSettings();
    services = await getPublishedServices();
    featured = await getPublishedProjects({ featured: true });
    ratings = await getPublishedSiteRatings();
    whyChoose = await getPublishedWhyChooseUs();
    testimonials = await getPublishedTestimonials();
    const map = await getCoverMap(featured);
    for (const p of featured) {
      const media = p.cover_media_id ? map.get(p.cover_media_id) : null;
      covers[p.id] = await signMediaUrl(media?.thumbnail_url || media?.storage_path || media?.public_url);
    }
  } catch {
    /* Supabase not configured yet */
  }

  const quotation = settings?.brand_quotation || settings?.tagline || "";
  const eventTypes = Array.from(new Set(services.map((s) => s.title).filter(Boolean)));

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

      <section className="bg-ivory px-6 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Ratings</p>
          {ratings.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ratings.map((r) => (
                <article key={r.id} className="border border-charcoal/10 bg-paper p-6 text-center">
                  <p className="font-serif text-4xl">{r.value}</p>
                  <p className="mt-2 text-[11px] tracking-[0.2em] uppercase text-earth">{r.label}</p>
                  {r.caption ? <p className="mt-2 text-sm text-charcoal/60">{r.caption}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState>Ratings will appear here once they are published from the studio.</EmptyState>
          )}
        </div>
      </section>

      <section className="bg-cream/50 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Quotation</p>
          {quotation ? (
            <p className="mt-6 font-serif text-3xl leading-snug text-charcoal md:text-4xl">“{quotation}”</p>
          ) : (
            <EmptyState>A brand statement will appear here once it is added in studio settings.</EmptyState>
          )}
        </div>
      </section>

      <section className="bg-charcoal px-6 py-24 text-ivory md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.32em] text-gold uppercase">Services</p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">What we plan</h2>
            </div>
            <Link href="/services" className="hidden text-[11px] tracking-[0.28em] uppercase text-gold md:block">
              All services
            </Link>
          </div>
          {services.length ? (
            <div className="mt-14 flex gap-4 overflow-x-auto pb-2">
              {services.map((s) => (
                <div key={s.id} className="w-72 shrink-0 bg-charcoal">
                  <ServiceCard service={s} />
                </div>
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
          <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Featured events</p>
          <h2 className="mt-3 font-serif text-4xl md:text-6xl">On the floor</h2>
          {featured.length ? (
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <article key={p.id} className="relative min-h-[260px] overflow-hidden bg-charcoal text-ivory">
                  {covers[p.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={covers[p.id] || ""} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-earth/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                  <div className="absolute bottom-0 p-6">
                    <p className="text-[10px] tracking-[0.28em] uppercase text-gold">{p.event_type}</p>
                    <h3 className="mt-2 font-serif text-2xl">{p.title}</h3>
                    <p className="mt-1 text-sm text-ivory/70">
                      {[p.location, formatDate(p.event_date)].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={`/portfolio/${p.slug}`} className="text-[11px] tracking-[0.2em] uppercase text-gold">
                        View event
                      </Link>
                      {isPublicLiveUrl(p.live_url) ? (
                        <a
                          href={p.live_url!}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] tracking-[0.2em] uppercase text-ivory"
                        >
                          Watch live
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState>Published featured events will appear here once they are added in the studio.</EmptyState>
          )}
        </div>
      </section>

      <section className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Why choose us</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Why Uma Events</h2>
          {whyChoose.length ? (
            <ul className="mt-12 grid gap-8 md:grid-cols-3">
              {whyChoose.map((item) => (
                <li key={item.id}>
                  <p className="font-serif text-2xl">{item.title}</p>
                  {item.body ? <p className="mt-2 text-sm leading-relaxed text-charcoal/80">{item.body}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>Reasons to work with the studio will appear here once they are published.</EmptyState>
          )}
        </div>
      </section>

      <section className="bg-ivory px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Testimonials</p>
          <h2 className="mt-3 font-serif text-4xl">From hosts</h2>
          {testimonials.length ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {testimonials.map((t) => (
                <blockquote key={t.id} className="border border-charcoal/10 bg-paper p-8">
                  <p className="font-serif text-2xl leading-snug">“{t.quote}”</p>
                  {(t.author_name || t.author_role) && (
                    <footer className="mt-4 text-sm text-charcoal/60">
                      {[t.author_name, t.author_role].filter(Boolean).join(" · ")}
                    </footer>
                  )}
                </blockquote>
              ))}
            </div>
          ) : (
            <EmptyState>Published testimonials will appear here. None have been added yet.</EmptyState>
          )}
        </div>
      </section>

      <ContactSection eventTypes={eventTypes} heading="Tell us about the day" />
    </>
  );
}
