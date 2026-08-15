import type { Metadata } from "next";
import { getPublishedServices } from "@/lib/queries/public";
import { EmptyState } from "@/components/public/empty-state";
import { ServiceCard } from "@/components/public/service-card";

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

  return (
    <main className="px-6 pb-24 pt-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Services</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
          What Uma Events can shape
        </h1>
        {services.length ? (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <EmptyState>Published services will appear here once the studio has marked them live.</EmptyState>
        )}
      </div>
    </main>
  );
}
