import type { Metadata } from "next";
import { getPublishedServices } from "@/lib/queries/public";
import { PageBanner } from "@/components/public/page-banner";
import { HoverZoom, Reveal } from "@/components/public/motion";
import { UmaButton } from "@/components/public/ui";
import { ServiceActions, ServicePortrait } from "@/components/public/service-portrait";
import { craftServices } from "@/lib/public/service-visuals";
import { DESIGN_CRAFT_STILL } from "@/lib/public/design-visuals";

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

  const rows = craftServices(services);
  const banner = services.find((s) => s.image_url)?.image_url || DESIGN_CRAFT_STILL;
  const cmsLive = services.length > 0;

  return (
    <main className="uma-cine-page">
      <PageBanner
        eyebrow="The craft"
        title="What Uma Events can shape"
        copy="These are capabilities, not packages. Every gathering is planned according to the brief."
        image={banner}
      />
      <section className="uma-services-detail uma-surface-dark">
        {!cmsLive ? (
          <p className="uma-empty uma-empty--on-ink uma-services-note">
            Published service notes from the studio will appear here when they are marked live. The illustrations are the
            visual identities of the gatherings Uma Events plans.
          </p>
        ) : null}
        <ol className="uma-services-detail-list">
          {rows.map((service, i) => (
            <li key={service.key} id={service.slug}>
              <Reveal>
                <article className="uma-service-detail" data-kind={service.kind}>
                  <div className="uma-service-detail-visual">
                    {service.photo ? (
                      <div className="uma-service-detail-photo">
                        <HoverZoom className="h-full w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={service.photo} alt={service.title} loading="lazy" decoding="async" />
                        </HoverZoom>
                      </div>
                    ) : null}
                    {service.illustration ? (
                      <ServicePortrait
                        src={service.illustration}
                        title={service.title}
                        className="uma-service-detail-ident"
                      />
                    ) : null}
                  </div>
                  <div className="uma-service-detail-text">
                    <span className="uma-service-roman">{ROMAN[i] ?? i + 1}.</span>
                    <h2>{service.title}</h2>
                    {service.description ? <p>{service.description}</p> : null}
                    <ServiceActions slug={service.slug} />
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="uma-chapter-foot">
          <UmaButton href="/contact" variant="primary">
            Plan Your Event
          </UmaButton>
        </div>
      </section>
    </main>
  );
}
