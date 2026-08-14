"use client";

import Link from "next/link";
import type { Service } from "@/types";
import { Reveal } from "@/components/public/motion";
import { Eyebrow, UmaButton } from "@/components/public/ui";
import { slugify } from "@/lib/utils";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function HomeServices({ services }: { services: Service[] }) {
  const rows = services.slice(0, 6);

  return (
    <section className="uma-chapter uma-chapter--ivory">
      <div className="uma-chapter-inner uma-chapter-inner--narrow">
        <Reveal className="uma-chapter-head">
          <Eyebrow>The craft</Eyebrow>
          <h2 className="uma-section-title">What we compose</h2>
        </Reveal>

        {rows.length ? (
          <ol className="uma-service-list">
            {rows.map((service, i) => {
              const slug = slugify(service.title) || service.id;
              return (
                <li key={service.id}>
                  <Reveal delay={Math.min(i * 0.06, 0.24)}>
                    <Link href={`/services/${slug}`} className="uma-service-line">
                      <span className="uma-service-roman">{ROMAN[i] ?? i + 1}</span>
                      <span className="uma-service-copy">
                        <span className="uma-service-title">
                          {service.title}
                          <span className="uma-btn-arrow" aria-hidden>
                            →
                          </span>
                        </span>
                        {service.category ? <span className="uma-service-cat">{service.category}</span> : null}
                        {service.short_description ? <span className="uma-service-desc">{service.short_description}</span> : null}
                      </span>
                      {service.image_url ? (
                        <span className="uma-service-preview" aria-hidden>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={service.image_url} alt="" loading="lazy" decoding="async" />
                        </span>
                      ) : null}
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="uma-empty">Published services will appear here when the studio marks them live.</p>
        )}

        <div className="uma-chapter-foot">
          <UmaButton href="/services" variant="ghost">
            View all services
          </UmaButton>
        </div>
      </div>
    </section>
  );
}
