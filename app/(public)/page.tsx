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
import {
  cmsOrVisual,
  DESIGN_CRAFT_STILL,
  DESIGN_FILM,
  DESIGN_HERO_POSTER,
  DESIGN_QUOTE_STILL,
  DESIGN_STILLS,
} from "@/lib/public/design-visuals";

const PRINCIPLES = [
  { roman: "I", title: "Plan", copy: "Every gathering begins with listening — the people, the place, the feeling of the day." },
  { roman: "II", title: "Create", copy: "Details, sequence, and atmosphere are composed together, not added as afterthoughts." },
  { roman: "III", title: "Celebrate", copy: "When the hour arrives, the work is to hold the day so it can be lived, not managed." },
];

const WHY = [
  { roman: "I", title: "Thoughtful planning", copy: "Every detail begins with understanding your celebration — not a catalogue of packages." },
  { roman: "II", title: "Seamless execution", copy: "From preparation to the last farewell, the day is held as one considered whole." },
  { roman: "III", title: "Beautiful details", copy: "Spaces and sequences designed with intention, so the atmosphere feels inevitable." },
  { roman: "IV", title: "Your moment, your way", copy: "Your celebration should feel personal. The studio plans with you, not around a formula." },
];

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
  const cmsReel: Array<{
    id: string;
    title: string;
    href: string;
    eventType?: string | null;
    coverUrl: string;
  }> = [];

  for (const p of reelSource) {
    const cover = covers[p.id];
    if (cover) {
      cmsReel.push({
        id: p.id,
        title: p.title,
        href: `/portfolio/${p.slug}`,
        eventType: p.event_type,
        coverUrl: cover,
      });
    }
    try {
      const extras = await getProjectMedia(p.id);
      const extra = extras.find((m) => m.type === "PHOTO" && m.id !== p.cover_media_id);
      if (extra) {
        const url = await signMediaUrl(extra.thumbnail_url || extra.storage_path || extra.public_url);
        if (url) {
          cmsReel.push({
            id: extra.id,
            title: p.title,
            href: `/portfolio/${p.slug}`,
            eventType: p.event_type,
            coverUrl: url,
          });
        }
      }
    } catch {
      /* keep cover-only frame */
    }
  }

  const reel =
    cmsReel.length > 0
      ? cmsReel
      : DESIGN_STILLS.map((still, i) => ({
          id: `visual-${i}`,
          title: still.label,
          href: "/portfolio",
          eventType: null,
          coverUrl: still.src,
        }));

  const quoteImage =
    (featured[0] && covers[featured[0].id]) ||
    (reelSource[0] && covers[reelSource[0].id]) ||
    cmsOrVisual(settings?.hero_image_url, DESIGN_QUOTE_STILL);

  const film = settings?.hero_video_url || (!settings?.hero_image_url ? DESIGN_FILM : null);
  const poster = cmsOrVisual(settings?.hero_image_url, DESIGN_HERO_POSTER);
  const craftStill = services.find((s) => s.image_url)?.image_url || DESIGN_CRAFT_STILL;

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
    <div className="uma-home-cine uma-cine-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness(settings)) }}
      />

      <AmbientFilm video={film} image={poster} />

      <HomeVisual headline={headline} supporting={supporting} />
      <OrganicDivider />

      <section className="uma-statement uma-surface-dark">
        <Reveal duration={1} y={28}>
          <p>{statement}</p>
        </Reveal>
      </section>

      <section className="uma-trust-cine uma-surface-dark">
        <Reveal className="uma-filmstrip-head">
          <Eyebrow className="uma-eyebrow--gold">The studio</Eyebrow>
          <h2>Thoughtful planning. Beautiful details. Seamless celebrations.</h2>
        </Reveal>
        <div className="uma-trust-grid">
          {PRINCIPLES.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08} className="uma-trust-item">
              <p className="uma-service-roman">{item.roman}</p>
              <h3>{item.title}</h3>
              <span className="uma-trust-rule" aria-hidden />
              <p>{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <EventReel frames={reel} />

      <HomeQuote eyebrow="Uma Events" text={quoteText} image={quoteImage} />

      <HomeServices services={services} backdrop={craftStill} />

      <HomeFeatured events={featured} covers={covers} />

      <section className="uma-why-cine uma-surface-dark">
        <div className="uma-why-cine-visual" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cmsOrVisual(featured[0] ? covers[featured[0].id] : null, DESIGN_STILLS[5].src)}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div className="uma-why-cine-wash" />
        </div>
        <div className="uma-why-cine-copy">
          <Reveal>
            <Eyebrow className="uma-eyebrow--gold">Approach</Eyebrow>
            <h2>Why Uma Events</h2>
            <p>
              {settings?.about_intro ||
                settings?.tagline ||
                "Presence in Vijayawada. A considered process. Planning and production held as one."}
            </p>
          </Reveal>
          <ol className="uma-why-list">
            {WHY.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <li className="uma-why-item">
                  <span className="uma-service-roman">{item.roman}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

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
