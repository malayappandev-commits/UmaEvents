import Link from "next/link";
import type { Service } from "@/types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="overflow-hidden border border-charcoal/10 bg-paper">
      {service.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={service.image_url} alt={service.title} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-24 bg-cream" />
      )}
      <div className="p-6">
        <h3 className="font-serif text-2xl">{service.title}</h3>
        {service.short_description ? (
          <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{service.short_description}</p>
        ) : null}
        <Link
          href={`/services/${service.slug || service.id}`}
          className="mt-5 inline-block text-[11px] tracking-[0.22em] text-earth uppercase"
        >
          View more →
        </Link>
      </div>
    </article>
  );
}
