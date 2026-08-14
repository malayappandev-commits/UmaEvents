import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCoverMap,
  getPublishedProjects,
  getPublishedServices,
  signMediaUrl,
} from "@/lib/queries/public";
import { PageBanner } from "@/components/public/page-banner";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { EventReel } from "@/components/public/event-reel";
import { HomeTestimonials } from "@/components/public/home-testimonials";
import { Reveal } from "@/components/public/motion";
import { Eyebrow, UmaButton } from "@/components/public/ui";
import { serviceKind } from "@/lib/public/service-kind";
import { identityBySlug, matchPublishedService, SERVICE_IDENTITIES } from "@/lib/public/service-visuals";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICE_IDENTITIES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const identity = identityBySlug(slug);
  if (!identity) return { title: "Service" };
  return {
    title: identity.title,
    description: `${identity.title} — Uma Events, Vijayawada.`,
    alternates: { canonical: `/services/${identity.slug}` },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const identity = identityBySlug(slug);
  if (!identity) notFound();

  let published: Awaited<ReturnType<typeof getPublishedServices>> = [];
  let projects: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  const covers: Record<string, string | null> = {};

  try {
    published = await getPublishedServices();
    projects = await getPublishedProjects();
    const related = projects.filter((p) => serviceKind(p.event_type, p.title) === identity.kind);
    const map = await getCoverMap(related);
    for (const p of related) {
      const media = p.cover_media_id ? map.get(p.cover_media_id) : null;
      covers[p.id] = await signMediaUrl(media?.thumbnail_url || media?.storage_path || media?.public_url);
    }
    projects = related;
  } catch {
    published = [];
    projects = [];
  }

  const cms = matchPublishedService(published, identity);
  const photo = cms?.image_url || identity.atmosphere;
  const description = cms?.short_description || "Planned according to the brief — not as a package.";
  const reel = projects
    .map((p) => {
      const cover = covers[p.id];
      if (!cover) return null;
      return {
        id: p.id,
        title: p.title,
        href: `/portfolio/${p.slug}`,
        eventType: p.event_type,
        coverUrl: cover,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    title: string;
    href: string;
    eventType: string | null;
    coverUrl: string;
  }>;

  return (
    <main className="uma-cine-page">
      <PageBanner eyebrow="Service" title={cms?.title || identity.title} copy={description} image={photo} />
      <section className="uma-service-chapter uma-surface-dark">
        <Reveal>
          <Eyebrow className="uma-eyebrow--gold">The gathering</Eyebrow>
          <h2 className="uma-section-title">{cms?.title || identity.title}</h2>
          <p className="uma-cine-lead">{description}</p>
          {!cms ? (
            <p className="uma-empty uma-empty--on-ink uma-services-note">
              A fuller studio note for this service will appear when it is published.
            </p>
          ) : null}
          <div className="uma-service-actions">
            <UmaButton href="/contact" variant="primary">
              Plan Your Event
            </UmaButton>
          </div>
        </Reveal>
      </section>

      {reel.length ? <EventReel frames={reel} headed={false} /> : null}

      <HomeTestimonials items={[]} />

      <section className="uma-final-cta uma-surface-dark">
        <div className="uma-final-cta-inner">
          <Eyebrow className="uma-eyebrow--gold">Begin</Eyebrow>
          <h2>Plan this gathering</h2>
          <p className="uma-contact-lead uma-contact-lead--center">Share a few details. Every event is planned on its own terms.</p>
          <div className="uma-final-form mt-8">
            <EnquiryForm eventTypes={[cms?.title || identity.title]} tone="dark" />
          </div>
        </div>
      </section>
    </main>
  );
}
