import type { Metadata } from "next";
import { getPublishedServices } from "@/lib/queries/public";
import { HoverZoom, Reveal } from "@/components/public/motion";
import { Eyebrow, UmaButton } from "@/components/public/ui";

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
    <main className="uma-page">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>Services</Eyebrow>
          <h1 className="uma-display mt-4 max-w-3xl">What Uma Events can shape</h1>
          <p className="mt-6 max-w-2xl text-lg text-charcoal/70">
            These are capabilities, not packages. Every gathering is planned according to the brief —
            there is no catalogue of tiers to choose from.
          </p>
        </Reveal>
        {services.length ? (
          <div className="mt-16 space-y-16">
            {[...groups.entries()].map(([cat, items]) => (
              <section key={cat}>
                <h2 className="uma-eyebrow">{cat}</h2>
                <div className="mt-6 grid gap-8 md:grid-cols-2">
                  {items.map((s, i) => (
                    <Reveal key={s.id} delay={i * 0.05}>
                      <article className="group overflow-hidden border border-charcoal/10 bg-paper">
                        {s.image_url ? (
                          <HoverZoom>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.image_url} alt={s.title} className="h-56 w-full object-cover" />
                          </HoverZoom>
                        ) : (
                          <div className="h-24 bg-gradient-to-r from-cream to-sand" />
                        )}
                        <div className="p-8">
                          <h3 className="font-serif text-3xl">{s.title}</h3>
                          <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{s.short_description}</p>
                        </div>
                      </article>
                    </Reveal>
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
        <UmaButton href="/contact" variant="ghost" className="mt-16">
          Plan Your Event
        </UmaButton>
      </div>
    </main>
  );
}
