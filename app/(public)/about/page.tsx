import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/public";
import { EmptyState } from "@/components/public/empty-state";

export const metadata: Metadata = {
  title: "AboutUS",
  description: "Uma Events is an event management and planning studio based in Vijayawada, Andhra Pradesh.",
  alternates: { canonical: "/about" },
};

function AboutBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="border-t border-charcoal/10 py-16">
      <h2 className="font-serif text-4xl">{title}</h2>
      {body.trim() ? (
        <p className="mt-6 max-w-3xl whitespace-pre-wrap text-lg leading-8 text-charcoal/80">{body}</p>
      ) : (
        <EmptyState>This section will appear once the studio has added it.</EmptyState>
      )}
    </section>
  );
}

export default async function AboutPage() {
  let settings = null;
  try {
    settings = await getSettings();
  } catch {
    settings = null;
  }

  return (
    <main className="px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] tracking-[0.32em] text-earth uppercase">AboutUS</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">
          {settings?.studio_name || "Uma Events"}
        </h1>
        <AboutBlock title="Who we are" body={settings?.who_we_are || settings?.about_intro || ""} />
        <AboutBlock title="Why trust us" body={settings?.why_trust_us || ""} />
        <AboutBlock title="Founder and team" body={settings?.founder_and_team || ""} />
        <AboutBlock title="Collaborations" body={settings?.collaborations || ""} />
      </div>
    </main>
  );
}
