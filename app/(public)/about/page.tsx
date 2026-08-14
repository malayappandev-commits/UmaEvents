import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/public";
import { GoldLineReveal, Reveal } from "@/components/public/motion";
import { Eyebrow, Quote } from "@/components/public/ui";

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
    <main className="uma-page">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Eyebrow>The studio</Eyebrow>
          <h1 className="uma-display mt-4">{settings?.studio_name || "Uma Events"}</h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-charcoal/75">
            {settings?.about_intro ||
              "Uma Events is an event management and event planning studio based in Vijayawada, Andhra Pradesh."}
          </p>
        </Reveal>
        <GoldLineReveal className="my-16" />
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="relative md:col-span-5">
            <div className="aspect-[3/4] bg-gradient-to-br from-sand to-earth/40" />
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-7">
            <Quote className="mb-8">Cinematic celebrations, planned with warmth.</Quote>
            <p className="whitespace-pre-wrap text-lg leading-8 text-charcoal/80">
              {settings?.about_story ||
                "The studio plans and produces gatherings — weddings, celebrations, and hosted programmes — with attention to space, sequence, and atmosphere. Details about the team belong here, and can be edited from the studio settings so the story stays accurate."}
            </p>
            <dl className="mt-12 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="uma-eyebrow">Based in</dt>
                <dd className="mt-2 font-serif text-2xl">Vijayawada</dd>
              </div>
              <div>
                <dt className="uma-eyebrow">Region</dt>
                <dd className="mt-2 font-serif text-2xl">Andhra Pradesh</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
