import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/public";
import { PageBanner } from "@/components/public/page-banner";
import { GoldLineReveal, Reveal } from "@/components/public/motion";
import { Eyebrow, UmaButton } from "@/components/public/ui";
import { DESIGN_STILLS } from "@/lib/public/design-visuals";

export const metadata: Metadata = {
  title: "About",
  description: "Uma Events is an event management and planning studio based in Vijayawada, Andhra Pradesh.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  let settings = null;
  try {
    settings = await getSettings();
  } catch {
    settings = null;
  }

  return (
    <main className="uma-cine-page">
      <PageBanner
        eyebrow="The studio"
        title={settings?.studio_name || "Uma Events"}
        copy={
          settings?.about_intro ||
          "Uma Events is an event management and event planning studio based in Vijayawada, Andhra Pradesh."
        }
        image={settings?.hero_image_url || DESIGN_STILLS[0].src}
      />
      <section className="uma-cine-split uma-surface-dark">
        <Reveal className="uma-cine-split-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={DESIGN_STILLS[7].src} alt="" loading="lazy" decoding="async" />
        </Reveal>
        <Reveal delay={0.08} className="uma-cine-split-copy">
          <Eyebrow className="uma-eyebrow--gold">Story</Eyebrow>
          <p className="uma-cine-lead">
            {settings?.about_story ||
              "The studio plans and produces gatherings — weddings, celebrations, and hosted programmes — with attention to space, sequence, and atmosphere."}
          </p>
          <GoldLineReveal className="mt-10 max-w-[8rem]" delay={0.12} />
          <dl className="uma-cine-meta">
            <div>
              <dt className="uma-eyebrow uma-eyebrow--gold">Based in</dt>
              <dd>{settings?.address || "Vijayawada"}</dd>
            </div>
            <div>
              <dt className="uma-eyebrow uma-eyebrow--gold">Region</dt>
              <dd>Andhra Pradesh</dd>
            </div>
          </dl>
          <UmaButton href="/contact" variant="primary" className="mt-10">
            Plan Your Event
          </UmaButton>
        </Reveal>
      </section>
    </main>
  );
}
