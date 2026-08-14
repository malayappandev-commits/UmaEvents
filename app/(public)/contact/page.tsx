import type { Metadata } from "next";
import { getEventTypes, getSettings } from "@/lib/queries/public";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { Reveal } from "@/components/public/motion";
import { Eyebrow } from "@/components/public/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Enquire with Uma Events in Vijayawada about your gathering.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  let settings = null;
  let types: string[] = [];
  try {
    settings = await getSettings();
    types = await getEventTypes();
  } catch {
    settings = null;
  }

  return (
    <main className="uma-page">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <Eyebrow>Contact Us</Eyebrow>
          <h1 className="uma-display mt-4">Begin a conversation</h1>
          <p className="mt-6 text-charcoal/70">
            Tell Uma Events about the gathering. The studio will reply with next steps — not a menu of
            packages.
          </p>
          <div className="mt-10 space-y-3 text-sm">
            <p>{settings?.address || "Vijayawada, Andhra Pradesh"}</p>
            {settings?.phone ? <p>{settings.phone}</p> : null}
            {settings?.contact_email ? (
              <a className="block hover:text-earth" href={`mailto:${settings.contact_email}`}>
                {settings.contact_email}
              </a>
            ) : null}
          </div>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-7">
          <EnquiryForm eventTypes={types} />
        </Reveal>
      </div>
    </main>
  );
}
