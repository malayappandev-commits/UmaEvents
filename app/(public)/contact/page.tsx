import type { Metadata } from "next";
import { getEventTypes, getSettings } from "@/lib/queries/public";
import { EnquiryForm } from "@/components/public/enquiry-form";

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
    <main className="px-6 pb-24 pt-12 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Contact</p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Begin a conversation</h1>
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
        </div>
        <div className="md:col-span-7">
          <EnquiryForm eventTypes={types} />
        </div>
      </div>
    </main>
  );
}
