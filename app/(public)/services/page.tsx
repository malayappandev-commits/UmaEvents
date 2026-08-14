import type { Metadata } from "next";
import { getPublishedServices } from "@/lib/queries/public";
import { PageBanner } from "@/components/public/page-banner";
import { HoverZoom, Reveal } from "@/components/public/motion";
import { UmaButton } from "@/components/public/ui";
import { serviceKind } from "@/lib/public/service-kind";
import { DESIGN_CRAFT_STILL, DESIGN_STILLS } from "@/lib/public/design-visuals";

export const metadata: Metadata = {
  title: "Services",
  description: "Event management services from Uma Events in Vijayawada — planned individually, not as packages.",
  alternates: { canonical: "/services" },
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export default async function ServicesPage() {
  let services: Awaited<ReturnType<typeof getPublishedServices>> = [];
  try {
    services = await getPublishedServices();
  } catch {
    services = [];
  }

  return (
    <main className="uma-cine-page">
      <PageBanner
        eyebrow="The craft"
        title="What Uma Events can shape"
        copy="These are capabilities, not packages. Every gathering is planned according to the brief."
        image={services.find((s) => s.image_url)?.image_url || DESIGN_CRAFT_STILL}
      />
      <section className="uma-services-detail uma-surface-dark">
        {services.length ? (
          <ol className="uma-services-detail-list">
            {services.map((service, i) => {
              const kind = serviceKind(service.title, service.category);
              const visual = service.image_url || DESIGN_STILLS[i % DESIGN_STILLS.length].src;
              return (
                <li key={service.id}>
                  <Reveal>
                    <article className="uma-service-detail" data-kind={kind}>
                      <div className="uma-service-detail-photo">
                        <HoverZoom className="h-full w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={visual} alt={service.image_url ? service.title : ""} loading="lazy" decoding="async" />
                        </HoverZoom>
                      </div>
                      <div className="uma-service-detail-text">
                        <span className="uma-service-roman">{ROMAN[i] ?? i + 1}.</span>
                        {service.category ? <p className="uma-service-cat">{service.category}</p> : null}
                        <h2>{service.title}</h2>
                        {service.short_description ? <p>{service.short_description}</p> : null}
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="uma-empty uma-empty--on-ink">
            Published services will appear here once the studio has marked them live.
          </p>
        )}
        <div className="uma-chapter-foot">
          <UmaButton href="/contact" variant="primary">
            Plan Your Event
          </UmaButton>
        </div>
      </section>
    </main>
  );
}
