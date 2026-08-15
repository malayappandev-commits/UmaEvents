import { EnquiryForm } from "@/components/public/enquiry-form";

export function ContactSection({
  eventTypes,
  heading = "Contact us",
}: {
  eventTypes: string[];
  heading?: string;
}) {
  return (
    <section className="bg-cream px-6 py-24 md:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] tracking-[0.32em] text-earth uppercase">Contact us</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">{heading}</h2>
        <p className="mt-4 text-charcoal/70">
          Share a few details. The studio will reply with next steps.
        </p>
        <div className="mt-10">
          <EnquiryForm eventTypes={eventTypes} />
        </div>
      </div>
    </section>
  );
}
