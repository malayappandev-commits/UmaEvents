import {
  getCoverMap,
  getProjectMedia,
  getPublishedProjects,
  getPublishedServices,
  getSettings,
  signMediaUrl,
} from "@/lib/queries/public";
import { jsonLdLocalBusiness } from "@/lib/seo";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { HomeVisual } from "@/components/public/home-visual";
import { AmbientFilm } from "@/components/public/ambient-film";
import { OrganicDivider } from "@/components/public/organic-divider";
import { EventReel } from "@/components/public/event-reel";
import { HomeServices } from "@/components/public/home-services";
import { HomeFeatured } from "@/components/public/home-featured";
import { HomeQuote } from "@/components/public/home-quote";
import { HomeTestimonials } from "@/components/public/home-testimonials";
import { FadeReveal, Reveal } from "@/components/public/motion";
import { Eyebrow } from "@/components/public/ui";
import { BRAND_TAGLINE } from "@/lib/public/nav";
import { whatsappHref } from "@/lib/utils";

export default async function HomePage() {
  let settings = null;
  let services: Awaited<ReturnType<typeof getPublishedServices>> = [];
  let projects: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  const covers: Record<string, string | null> = {};

  try {
    settings = await getSettings();
    services = await getPublishedServices();
    projects = await getPublishedProjects();
    const map = await getCoverMap(projects);
    for (const p of projects) {
      const media = p.cover_media_id ? map.get(p.cover_media_id) : null;
      covers[p.id] = await signMediaUrl(media?.thumbnail_url || media?.storage_path || media?.public_url);
    }
  } catch {
    /* Supabase not configured yet */
  }

  const featured = projects.filter((p) => p.featured);
  const reelSource = projects.slice(0, 8);
  const reel: Array<{
    id: string;
    title: string;
    slug: string;
    eventType: string;
    coverUrl: string | null;
  }> = [];

  for (const p of reelSource) {
    reel.push({
      id: p.id,
      title: p.title,
      slug: p.slug,
      eventType: p.event_type,
      coverUrl: covers[p.id] ?? null,
    });
    try {
      const extras = await getProjectMedia(p.id);
      const extra = extras.find((m) => m.type === "PHOTO" && m.id !== p.cover_media_id);
      if (extra) {
        const url = await signMediaUrl(extra.thumbnail_url || extra.storage_path || extra.public_url);
        if (url) {
          reel.push({
            id: extra.id,
            title: p.title,
            slug: p.slug,
            eventType: p.event_type,
            coverUrl: url,
          });
        }
      }
    } catch {
      /* keep cover-only frame */
    }
  }

  const quoteImage =
    (featured[0] && covers[featured[0].id]) ||
    (reelSource[0] && covers[reelSource[0].id]) ||
    settings?.hero_image_url ||
    null;
  const eventTypes = Array.from(
    new Set([
      ...services.map((s) => s.title).filter(Boolean),
      ...services.map((s) => s.category).filter(Boolean),
      ...projects.map((p) => p.event_type).filter(Boolean),
    ]),
  );
  const supporting =
    settings?.hero_subheadline ||
    settings?.about_intro ||
    "Uma Events composes weddings and milestone celebrations so the day plays back in memory exactly as it felt in person.";
  const headline = settings?.hero_headline || "Every celebration has a story worth holding.";
  const statement = settings?.about_intro || settings?.tagline || BRAND_TAGLINE;
  const quoteText = settings?.tagline || settings?.hero_headline || BRAND_TAGLINE;
  const whatsapp = whatsappHref(settings?.phone);

  return (
    <div className="uma-home-cine">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness(settings)) }}
      />

      <AmbientFilm video={settings?.hero_video_url} image={settings?.hero_image_url} />

      <HomeVisual headline={headline} supporting={supporting} />
      <OrganicDivider />

      <section className="uma-statement uma-surface-dark">
        <Reveal duration={1} y={28}>
          <p>{statement}</p>
        </Reveal>
      </section>

      <EventReel frames={reel} />

      <HomeQuote eyebrow="Uma Events" text={quoteText} image={quoteImage} />

      <HomeServices services={services} />

      <HomeFeatured events={featured} covers={covers} />

      <HomeTestimonials items={[]} />

      <section className="uma-final-cta uma-surface-dark">
        <div className="uma-final-cta-inner">
          <FadeReveal>
            <Eyebrow className="uma-eyebrow--gold">Begin</Eyebrow>
            <h2>Let&apos;s create something worth remembering.</h2>
            <p className="uma-contact-lead uma-contact-lead--center">
              Share a few details. Every gathering is planned on its own terms.
            </p>
            <div className="uma-contact-secondary uma-contact-secondary--center">
              {settings?.phone ? (
                <a className="uma-btn uma-btn-primary" href={`tel:${settings.phone.replace(/\s+/g, "")}`}>
                  <span>Call {settings.phone}</span>
                </a>
              ) : null}
              {whatsapp ? (
                <a className="uma-btn uma-btn-secondary" href={whatsapp} target="_blank" rel="noreferrer">
                  <span>WhatsApp</span>
                </a>
              ) : null}
              {settings?.contact_email ? (
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              ) : null}
            </div>
          </FadeReveal>
          <Reveal delay={0.08} className="uma-final-form">
            <EnquiryForm eventTypes={eventTypes} tone="dark" />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
