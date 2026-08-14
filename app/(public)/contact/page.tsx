import type { Metadata } from "next";
import { getEventTypes, getPublishedServices, getSettings } from "@/lib/queries/public";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { PageBanner } from "@/components/public/page-banner";
import { Reveal } from "@/components/public/motion";
import { Eyebrow } from "@/components/public/ui";
import { whatsappHref } from "@/lib/utils";
import { DESIGN_STILLS } from "@/lib/public/design-visuals";

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
    const services = await getPublishedServices();
    const fromProjects = await getEventTypes();
    types = Array.from(
      new Set([...fromProjects, ...services.map((s) => s.title), ...services.map((s) => s.category)].filter(Boolean)),
    );
  } catch {
    settings = null;
  }

  const whatsapp = whatsappHref(settings?.phone);

  return (
    <main className="uma-cine-page">
      <PageBanner
        eyebrow="Begin"
        title="Plan Your Event"
        copy="Tell Uma Events about the gathering. The studio will reply with next steps — not a menu of packages."
        image={settings?.hero_image_url || DESIGN_STILLS[5].src}
      />
      <section className="uma-contact-cine uma-surface-dark">
        <Reveal className="uma-contact-cine-copy">
          <Eyebrow className="uma-eyebrow--gold">Studio</Eyebrow>
          <p>{settings?.address || "Vijayawada, Andhra Pradesh"}</p>
          <div className="uma-contact-secondary">
            {settings?.phone ? (
              <a className="uma-btn uma-btn-primary" href={`tel:${settings.phone.replace(/\s+/g, "")}`}>
                <span>Call {settings.phone}</span>
              </a>
            ) : null}
            {whatsapp ? (
              <a className="uma-btn uma-btn-secondary" href={whatsapp} target="_blank" rel="noreferrer">
                <span>WhatsApp</span>
              </a>
            ) : null}
            {settings?.contact_email ? <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a> : null}
          </div>
        </Reveal>
        <Reveal delay={0.08} className="uma-final-form">
          <EnquiryForm eventTypes={types} tone="dark" />
        </Reveal>
      </section>
    </main>
  );
}
