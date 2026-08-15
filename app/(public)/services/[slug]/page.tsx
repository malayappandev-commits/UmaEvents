import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedServiceBySlug,
  getPublishedServices,
  getServiceMedia,
  getServiceRatings,
  publicAssetUrl,
} from "@/lib/queries/public";
import { ContactSection } from "@/components/public/contact-section";
import { EmptyState } from "@/components/public/empty-state";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const service = await getPublishedServiceBySlug(slug);
    if (!service) return { title: "Service" };
    return {
      title: service.title,
      description: service.short_description || `${service.title} — Uma Events`,
      alternates: { canonical: `/services/${service.slug}` },
    };
  } catch {
    return { title: "Service" };
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  let service = null;
  let gallery: Awaited<ReturnType<typeof getServiceMedia>> = [];
  let ratings: Awaited<ReturnType<typeof getServiceRatings>> = [];
  let allServices: Awaited<ReturnType<typeof getPublishedServices>> = [];

  try {
    service = await getPublishedServiceBySlug(slug);
    if (service) {
      gallery = await getServiceMedia(service.id);
      ratings = await getServiceRatings(service.id);
    }
    allServices = await getPublishedServices();
  } catch {
    service = null;
  }

  if (!service) notFound();

  const offerings = service.offerings?.filter(Boolean) ?? [];
  const eventTypes = Array.from(new Set(allServices.map((s) => s.title)));

  return (
    <main>
      <section className="px-6 pb-16 pt-12 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-[11px] tracking-[0.32em] text-earth uppercase">{service.category || "Service"}</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl">{service.title}</h1>
            {service.short_description ? (
              <p className="mt-6 text-lg text-charcoal/75">{service.short_description}</p>
            ) : null}
            {service.long_description ? (
              <p className="mt-6 whitespace-pre-wrap leading-7 text-charcoal/80">{service.long_description}</p>
            ) : null}
            {offerings.length ? (
              <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-charcoal/80">
                {offerings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <EmptyState>The studio has not listed specific inclusions for this service yet.</EmptyState>
            )}
          </div>
          <div className="md:col-span-5">
            {service.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={service.image_url} alt={service.title} className="aspect-square w-full object-cover" />
            ) : (
              <div className="aspect-square bg-cream" />
            )}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-4xl">Service gallery</h2>
          {gallery.length ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {gallery.map((item) => {
                const src = publicAssetUrl(item.public_url || item.storage_path);
                return (
                  <figure key={item.id} className="aspect-square overflow-hidden bg-cream">
                    {item.type === "VIDEO" && src ? (
                      <video src={src} controls className="h-full w-full object-cover" />
                    ) : src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={item.filename} className="h-full w-full object-cover" />
                    ) : null}
                  </figure>
                );
              })}
            </div>
          ) : (
            <EmptyState>No gallery media has been published for this service yet.</EmptyState>
          )}
        </div>
      </section>

      <section className="bg-ivory px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-4xl">Service ratings / reviews</h2>
          {ratings.length ? (
            <ul className="mt-8 space-y-6">
              {ratings.map((r) => (
                <li key={r.id} className="border border-charcoal/10 bg-paper p-6">
                  <p className="text-sm tracking-[0.16em] uppercase text-earth">{r.rating} / 5</p>
                  {r.review ? <p className="mt-3 text-charcoal/80">{r.review}</p> : null}
                  {r.customer_name ? <p className="mt-3 text-sm text-charcoal/50">{r.customer_name}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No published customer ratings for this service yet.</EmptyState>
          )}
        </div>
      </section>

      <ContactSection eventTypes={eventTypes.length ? eventTypes : [service.title]} />
    </main>
  );
}
