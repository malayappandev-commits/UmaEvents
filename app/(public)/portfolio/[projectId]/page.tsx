import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectMedia, getSettings, signMediaUrl } from "@/lib/queries/public";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { ProjectGallery } from "@/components/public/project-gallery";
import { Eyebrow, UmaButton } from "@/components/public/ui";
import { formatDate, siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ projectId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  try {
    const project = await getProjectBySlug(projectId);
    if (!project) return { title: "Event" };
    return {
      title: project.title,
      description: project.description?.slice(0, 160) || `${project.title} — Uma Events`,
      alternates: { canonical: `/portfolio/${project.slug}` },
      openGraph: {
        title: project.title,
        description: project.description?.slice(0, 160),
        url: `${siteUrl()}/portfolio/${project.slug}`,
      },
    };
  } catch {
    return { title: "Event" };
  }
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  let project = null;
  let media: Awaited<ReturnType<typeof getProjectMedia>> = [];
  let settings = null;
  try {
    project = await getProjectBySlug(projectId);
    if (project) media = await getProjectMedia(project.id);
    settings = await getSettings();
  } catch {
    project = null;
  }
  if (!project) notFound();

  const signed = await Promise.all(
    media.map(async (m) => ({
      ...m,
      displayUrl: await signMediaUrl(m.thumbnail_url || m.storage_path || m.public_url),
      fullUrl: await signMediaUrl(m.storage_path || m.public_url),
    })),
  );

  const photos = signed.filter((m) => m.type === "PHOTO");
  const videos = signed.filter((m) => m.type === "VIDEO");
  const hero = signed.find((m) => m.is_cover) || signed[0];
  const client = project.show_client_publicly ? project.client_name : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: project.title,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: hero?.fullUrl || undefined,
    location: project.location
      ? { "@type": "Place", name: project.location, address: project.location }
      : undefined,
    startDate: project.event_date || undefined,
    organizer: {
      "@type": "Organization",
      name: settings?.studio_name || "Uma Events",
    },
    description: project.description || undefined,
  };

  return (
    <main className="uma-cine-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="uma-surface-dark relative h-[70vh] min-h-[480px] overflow-hidden bg-ink text-ivory">
        {hero?.fullUrl ? (
          hero.type === "VIDEO" ? (
            <video className="uma-cinematic-media absolute inset-0" src={hero.fullUrl} autoPlay muted loop playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.fullUrl} alt={project.title} className="uma-cinematic-media absolute inset-0" />
          )
        ) : (
          <div className="uma-cinematic-fallback absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/visual/still-01.jpg" alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="uma-cinematic-overlay" />
        <div className="noise-overlay" />
        <div className="relative flex h-full flex-col justify-end px-6 pb-16 pt-24 md:px-16">
          <Eyebrow className="uma-eyebrow--gold">{project.event_type}</Eyebrow>
          <h1 className="uma-display mt-3">{project.title}</h1>
          <p className="mt-3 text-ivory/75">
            {[project.location, formatDate(project.event_date)].filter(Boolean).join(" · ")}
          </p>
        </div>
      </section>

      <section className="uma-cine-page uma-surface-dark mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <Eyebrow className="uma-eyebrow--gold">The event</Eyebrow>
          <dl className="mt-6 space-y-4 text-sm text-ivory/75">
            {client ? (
              <div>
                <dt className="uma-eyebrow uma-eyebrow--gold">Host</dt>
                <dd>{client}</dd>
              </div>
            ) : null}
            {project.photographer ? (
              <div>
                <dt className="uma-eyebrow uma-eyebrow--gold">Photography</dt>
                <dd>{project.photographer}</dd>
              </div>
            ) : null}
            {project.videographer ? (
              <div>
                <dt className="uma-eyebrow uma-eyebrow--gold">Film</dt>
                <dd>{project.videographer}</dd>
              </div>
            ) : null}
            {project.guest_count ? (
              <div>
                <dt className="uma-eyebrow uma-eyebrow--gold">Guests</dt>
                <dd>{project.guest_count}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="md:col-span-8">
          <Eyebrow className="uma-eyebrow--gold">Story</Eyebrow>
          <p className="mt-6 whitespace-pre-wrap text-lg leading-8 text-ivory/80">
            {project.description || "A gathering produced by Uma Events."}
          </p>
          {project.event_highlights?.length ? (
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {project.event_highlights.map((h) => (
                <li key={h} className="border-l border-gold pl-4 text-sm text-ivory/80">
                  {h}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {photos.length ? (
        <section className="uma-cine-page uma-surface-dark px-6 pb-16 md:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="uma-section-title">Gallery</h2>
            <ProjectGallery items={photos} />
          </div>
        </section>
      ) : null}

      {videos.length ? (
        <section className="bg-ink px-6 py-20 text-ivory md:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="uma-section-title">Film</h2>
            <div className="mt-10 space-y-10">
              {videos.map((v) => (
                <video key={v.id} controls className="w-full bg-black" src={v.fullUrl || undefined} poster={v.displayUrl || undefined}>
                  Your browser cannot play this video.
                </video>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="uma-final-cta uma-surface-dark">
        <div className="uma-final-cta-inner">
          <h2>Plan a gathering</h2>
          <p className="uma-contact-lead uma-contact-lead--center">Enquire about an event in the same spirit as this one.</p>
          <div className="uma-final-form mt-8">
            <EnquiryForm projectId={project.id} eventTypes={[project.event_type].filter(Boolean)} tone="dark" />
          </div>
          <UmaButton href="/portfolio" variant="secondary" className="mt-10">
            View Gallery
          </UmaButton>
        </div>
      </section>
    </main>
  );
}
