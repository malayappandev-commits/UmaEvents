import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/public";

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
    <main className="px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] tracking-[0.32em] text-earth uppercase">The studio</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">
          {settings?.studio_name || "Uma Events"}
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-charcoal/75">
          {settings?.about_intro ||
            "Uma Events is an event management and event planning studio based in Vijayawada, Andhra Pradesh."}
        </p>
        <div className="gold-rule my-16" />
        <div className="grid gap-12 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <div className="aspect-[3/4] bg-gradient-to-br from-sand to-earth/40 [transform:perspective(900px)_rotateY(-6deg)]" />
          </div>
          <div className="md:col-span-7">
            <p className="whitespace-pre-wrap text-lg leading-8 text-charcoal/80">
              {settings?.about_story ||
                "The studio plans and produces gatherings — weddings, celebrations, and hosted programmes — with attention to space, sequence, and atmosphere. Details about the team belong here, and can be edited from the studio settings so the story stays accurate."}
            </p>
            <dl className="mt-12 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] tracking-[0.28em] text-earth uppercase">Based in</dt>
                <dd className="mt-2 font-serif text-2xl">Vijayawada</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.28em] text-earth uppercase">Region</dt>
                <dd className="mt-2 font-serif text-2xl">Andhra Pradesh</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
