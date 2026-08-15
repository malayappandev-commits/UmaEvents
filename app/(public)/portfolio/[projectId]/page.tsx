import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getProjectMedia, getSettings, signMediaUrl } from "@/lib/queries/public";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { ProjectGallery } from "@/components/public/project-gallery";
import { formatDate, isPublicLiveUrl, siteUrl } from "@/lib/utils";

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
      displayUrl: await signMediaUrl(m.thumbnail_url || m.storage_path),
      fullUrl: await signMediaUrl(m.storage_path),
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
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden bg-ink text-ivory">
        {hero?.fullUrl ? (
          hero.type === "VIDEO" ? (
            <video className="absolute inset-0 h-full w-full object-cover" src={hero.fullUrl} autoPlay muted loop playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.fullUrl} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-earth/40 to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/30" />
        <div className="relative flex h-full flex-col justify-end px-6 pb-16 md:px-16">
          <p className="text-[11px] tracking-[0.32em] text-gold uppercase">{project.event_type}</p>
          <h1 className="mt-3 font-serif text-5xl md:text-7xl">{project.title}</h1>
          <p className="mt-3 text-ivory/75">
            {[project.location, formatDate(project.event_date)].filter(Boolean).join(" · ")}
          </p>
          {isPublicLiveUrl(project.live_url) ? (
            <a
              href={project.live_url!}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block border border-gold/50 px-4 py-2 text-[11px] tracking-[0.22em] uppercase text-gold"
            >
              Watch live
            </a>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <p className="text-[11px] tracking-[0.28em] text-earth uppercase">The event</p>
          <dl className="mt-6 space-y-4 text-sm">
            {client ? (
              <div>
                <dt className="text-charcoal/50">Host</dt>
                <dd>{client}</dd>
              </div>
            ) : null}
            {project.photographer ? (
              <div>
                <dt className="text-charcoal/50">Photography</dt>
                <dd>{project.photographer}</dd>
              </div>
            ) : null}
            {project.videographer ? (
              <div>
                <dt className="text-charcoal/50">Film</dt>
                <dd>{project.videographer}</dd>
              </div>
            ) : null}
            {project.guest_count ? (
              <div>
                <dt className="text-charcoal/50">Guests</dt>
                <dd>{project.guest_count}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="md:col-span-8">
          <p className="text-[11px] tracking-[0.28em] text-earth uppercase">Story</p>
          <p className="mt-6 whitespace-pre-wrap text-lg leading-8 text-charcoal/80">
            {project.description || "A gathering produced by Uma Events."}
          </p>
          {project.event_highlights?.length ? (
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {project.event_highlights.map((h) => (
                <li key={h} className="border-l border-gold pl-4 text-sm text-charcoal/80">
                  {h}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {photos.length ? (
        <section className="px-6 pb-16 md:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-serif text-4xl">Gallery</h2>
            <ProjectGallery items={photos} />
          </div>
        </section>
      ) : null}

      {videos.length ? (
        <section className="bg-ink px-6 py-20 text-ivory md:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-serif text-4xl">Film</h2>
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

      <section className="bg-cream px-6 py-20 md:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl">Plan a gathering</h2>
          <p className="mt-3 text-charcoal/70">Enquire about an event in the same spirit as this one.</p>
          <div className="mt-8">
            <EnquiryForm projectId={project.id} eventTypes={[project.event_type].filter(Boolean)} />
          </div>
          <Link href="/gallery" className="mt-10 inline-block text-[11px] tracking-[0.28em] uppercase text-earth">
            ← Gallery
          </Link>
        </div>
      </section>
    </main>
  );
}
