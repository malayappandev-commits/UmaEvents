import {
  getCoverMap,
  getPublishedProjects,
  getPublishedServices,
  getSettings,
  signMediaUrl,
} from "@/lib/queries/public";
import { jsonLdLocalBusiness } from "@/lib/seo";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { HomeVisual } from "@/components/public/home-visual";
import { EventReel } from "@/components/public/event-reel";
import { HomeServices } from "@/components/public/home-services";
import { HomeFeatured } from "@/components/public/home-featured";
import { HomeQuote } from "@/components/public/home-quote";
import { HomeTestimonials } from "@/components/public/home-testimonials";
import { FadeReveal, GoldLineReveal, Reveal } from "@/components/public/motion";
import { Eyebrow, RadialGlow, UmaButton } from "@/components/public/ui";
import { BRAND_TAGLINE } from "@/lib/public/nav";
import { whatsappHref } from "@/lib/utils";

const PRINCIPLES = [
  { roman: "I", title: "Plan", copy: "Every gathering begins with listening — the people, the place, the feeling of the day." },
  { roman: "II", title: "Create", copy: "Details, sequence, and atmosphere are composed together, not added as afterthoughts." },
  { roman: "III", title: "Celebrate", copy: "When the hour arrives, the work is to hold the day so it can be lived, not managed." },
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
  const reel = projects.slice(0, 8);
  const quoteImage = (featured[0] && covers[featured[0].id]) || settings?.hero_image_url || null;
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
    "From intimate celebrations to unforgettable occasions, we bring together thoughtful planning, beautiful details and seamless execution.";
  const line = settings?.tagline || settings?.hero_headline || BRAND_TAGLINE;
  const manifestoStatement =
    settings?.hero_headline || "Every celebration has a story. We help you hold it with care.";
  const manifestoCopy =
    settings?.about_intro ||
    "Uma Events is an event management and planning studio in Vijayawada. The work is atmosphere — space, sequence, and the quiet details that make a day feel considered.";
  const quoteText = settings?.tagline || settings?.hero_headline || line;
  const whatsapp = whatsappHref(settings?.phone);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness(settings)) }}
      />

      <HomeVisual
        line={line}
        supporting={supporting}
        image={settings?.hero_image_url}
        video={settings?.hero_video_url}
      />

      <section className="uma-chapter uma-chapter--ivory uma-manifesto">
        <RadialGlow className="-left-24 top-8" />
        <div className="uma-chapter-inner uma-chapter-inner--narrow">
          <div className="uma-manifesto-spread">
            <FadeReveal>
              <Eyebrow>Welcome</Eyebrow>
            </FadeReveal>
            <Reveal delay={0.12} duration={1} y={28}>
              <h2 className="uma-manifesto-title">{manifestoStatement}</h2>
            </Reveal>
            <GoldLineReveal className="mx-auto mt-10 max-w-[9rem]" delay={0.28} />
            <Reveal delay={0.36}>
              <p className="uma-manifesto-copy">{manifestoCopy}</p>
            </Reveal>
            <Reveal delay={0.44}>
              <UmaButton href="/about" variant="ghost" className="mt-10">
                About Us
              </UmaButton>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="uma-chapter uma-chapter--ivory uma-chapter--tight">
        <div className="uma-chapter-inner">
          <Reveal className="uma-chapter-head uma-chapter-head--center">
            <Eyebrow>The studio</Eyebrow>
            <p className="uma-trust-line">Thoughtful planning. Beautiful details. Seamless celebrations.</p>
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
        </div>
      </section>

      <EventReel
        frames={reel.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          eventType: p.event_type,
          coverUrl: covers[p.id] ?? null,
        }))}
      />

      <HomeQuote eyebrow="Uma Events" text={quoteText} image={quoteImage} />

      <HomeServices services={services} />

      <HomeFeatured events={featured} covers={covers} />

      <section className="uma-chapter uma-chapter--ivory">
        <div className="uma-chapter-inner uma-chapter-inner--narrow">
          <div className="uma-why-spread">
            <FadeReveal>
              <Eyebrow>Approach</Eyebrow>
            </FadeReveal>
            <Reveal delay={0.1} duration={1} y={28}>
              <h2 className="uma-why-statement">Why Uma Events</h2>
            </Reveal>
            <GoldLineReveal className="mx-auto mt-10 max-w-[8rem]" delay={0.24} />
            <Reveal delay={0.32}>
              <p className="uma-why-lead uma-why-lead--center">
                {settings?.about_intro ||
                  settings?.tagline ||
                  "Presence in Vijayawada. A considered process. Planning and production held as one."}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <HomeTestimonials items={[]} />

      <section className="uma-chapter uma-chapter--ink uma-contact-band">
        <div className="uma-chapter-inner uma-contact-grid">
          <FadeReveal>
            <Eyebrow className="uma-eyebrow--gold">Begin</Eyebrow>
            <h2 className="uma-section-title uma-contact-title">Let&apos;s create something worth remembering.</h2>
            <GoldLineReveal className="mt-8 max-w-[7rem]" delay={0.12} />
            <p className="uma-contact-lead">
              Share a few details. There are no packages to choose from — every gathering is planned on its own terms.
            </p>
            <div className="uma-contact-secondary">
              {settings?.phone ? (
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`}>Call {settings.phone}</a>
              ) : null}
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              ) : null}
              {settings?.contact_email ? <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a> : null}
            </div>
          </FadeReveal>
          <Reveal delay={0.1}>
            <EnquiryForm eventTypes={eventTypes} tone="dark" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
