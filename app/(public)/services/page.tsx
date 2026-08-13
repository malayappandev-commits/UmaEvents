import type { Metadata } from "next";
import { getPublishedServices } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Services",
  description: "Event management services from Uma Events in Vijayawada — planned individually, not as packages.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  let services: Awaited<ReturnType<typeof getPublishedServices>> = [];
  try {
    services = await getPublishedServices();
  } catch {
    services = [];
  }

  const groups = new Map<string, typeof services>();
  for (const s of services) {
    const key = s.category || "Services";
    groups.set(key, [...(groups.get(key) || []), s]);
  }

  return (
    <main className="px-6 pb-24 pt-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Services</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
          What Uma Events can shape
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-charcoal/70">
          These are capabilities, not packages. Every gathering is planned according to the brief —
          there is no catalogue of tiers to choose from.
        </p>
        {services.length ? (
          <div className="mt-16 space-y-16">
            {[...groups.entries()].map(([cat, items]) => (
              <section key={cat}>
                <h2 className="text-[11px] tracking-[0.28em] text-earth uppercase">{cat}</h2>
                <div className="mt-6 grid gap-8 md:grid-cols-2">
                  {items.map((s, i) => (
                    <article
                      key={s.id}
                      className="group overflow-hidden border border-charcoal/10 bg-paper"
                      style={{ transform: i % 2 ? "translateY(12px)" : undefined }}
                    >
                      {s.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image_url} alt={s.title} className="h-56 w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="h-24 bg-gradient-to-r from-cream to-sand" />
                      )}
                      <div className="p-8">
                        <h3 className="font-serif text-3xl">{s.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{s.short_description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="mt-16 max-w-xl text-charcoal/60">
            Published services will appear here once the studio has marked them live.
          </p>
        )}
      </div>
    </main>
  );
}
