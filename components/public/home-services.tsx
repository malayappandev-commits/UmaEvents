"use client";

import Link from "next/link";
import type { Service } from "@/types";
import { Reveal } from "@/components/public/motion";
import { Eyebrow } from "@/components/public/ui";
import { serviceKind } from "@/lib/public/service-kind";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function HomeServices({ services }: { services: Service[] }) {
  const rows = services.slice(0, 6);

  return (
    <section className="uma-services-cine uma-surface-dark">
      <Reveal className="uma-filmstrip-head">
        <Eyebrow className="uma-eyebrow--gold">The Craft</Eyebrow>
        <h2>What we compose</h2>
      </Reveal>

      {rows.length ? (
        <ol className="uma-service-list">
          {rows.map((service, i) => {
            const kind = serviceKind(service.title, service.category);
            return (
              <li key={service.id}>
                <Reveal delay={Math.min(i * 0.06, 0.24)}>
                  <Link
                    href="/services"
                    className="uma-service-line"
                    data-kind={kind}
                  >
                    <span className="uma-service-aura" aria-hidden />
                    <span className="uma-service-roman">{ROMAN[i] ?? i + 1}.</span>
                    <span className="uma-service-copy">
                      <span className="uma-service-title">{service.title}</span>
                      {service.short_description ? (
                        <span className="uma-service-desc">{service.short_description}</span>
                      ) : null}
                    </span>
                    {service.image_url ? (
                      <span className="uma-service-preview" aria-hidden>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={service.image_url} alt="" loading="lazy" decoding="async" />
                      </span>
                    ) : (
                      <span className="uma-service-preview uma-service-preview--slot" aria-hidden />
                    )}
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="uma-service-await" data-kind="default">
          <span className="uma-service-aura" aria-hidden />
          <p>Published service chapters will appear here — each with its own visual identity.</p>
        </div>
      )}

      <p className="uma-cine-more">
        <Link href="/services">See all services →</Link>
      </p>
    </section>
  );
}
