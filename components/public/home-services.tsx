"use client";

import type { Service } from "@/types";
import { Reveal } from "@/components/public/motion";
import { Eyebrow } from "@/components/public/ui";
import { ServiceActions, ServiceTitleLink, ServicesIndexLink } from "@/components/public/service-portrait";
import { craftServices } from "@/lib/public/service-visuals";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function HomeServices({
  services,
  backdrop,
}: {
  services: Service[];
  backdrop: string;
}) {
  const rows = craftServices(services);

  return (
    <section className="uma-services-cine uma-surface-dark">
      <div className="uma-services-cine-visual" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={backdrop} alt="" loading="lazy" decoding="async" />
        <div className="uma-services-cine-wash" />
      </div>
      <div className="uma-services-cine-copy">
        <Reveal className="uma-filmstrip-head">
          <Eyebrow className="uma-eyebrow--gold">The Craft</Eyebrow>
          <h2>What we compose</h2>
        </Reveal>

        {rows.length ? (
          <ol className="uma-service-list">
            {rows.map((service, i) => (
              <li key={service.key}>
                <Reveal delay={Math.min(i * 0.05, 0.28)}>
                  <div className="uma-service-line" data-kind={service.kind} tabIndex={0}>
                    <span className="uma-service-roman">{ROMAN[i] ?? i + 1}.</span>
                    <span className="uma-service-copy">
                      <ServiceTitleLink slug={service.slug} className="uma-service-title">
                        {service.title}
                      </ServiceTitleLink>
                      {service.description ? <span className="uma-service-desc">{service.description}</span> : null}
                      <ServiceActions slug={service.slug} />
                    </span>
                    {service.photo ? (
                      <span className="uma-service-preview" aria-hidden>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={service.photo} alt="" loading="lazy" decoding="async" />
                      </span>
                    ) : null}
                    <span className="uma-service-aura" aria-hidden />
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        ) : null}

        <p className="uma-cine-more">
          <ServicesIndexLink>See all services →</ServicesIndexLink>
        </p>
      </div>
    </section>
  );
}
