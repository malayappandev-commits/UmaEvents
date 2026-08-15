import nodemailer from "nodemailer";
import type { EnquiryInput } from "@/lib/validations/enquiry";

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function transporter() {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

function enquiryBody(enquiry: EnquiryInput) {
  return [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `Event type: ${enquiry.event_type || "—"}`,
    `Event date: ${enquiry.event_date || "—"}`,
    `Location: ${enquiry.location || "—"}`,
    `Guests: ${enquiry.guest_count ?? "—"}`,
    `Budget: ${enquiry.budget || "—"}`,
    "",
    enquiry.message,
  ].join("\n");
}

export async function sendEnquiryEmails(enquiry: EnquiryInput) {
  if (!smtpConfigured()) {
    return {
      adminSent: false as const,
      customerSent: false as const,
      reason: "smtp-not-configured" as const,
    };
  }

  const mailer = transporter();
  const adminTo = process.env.SMTP_TO || process.env.SMTP_FROM;
  const from = process.env.SMTP_FROM as string;

  await mailer.sendMail({
    from,
    to: adminTo,
    replyTo: enquiry.email,
    subject: `Uma Events enquiry${enquiry.event_type ? ` — ${enquiry.event_type}` : ""}`,
    text: enquiryBody(enquiry),
  });

  await mailer.sendMail({
    from,
    to: enquiry.email,
    subject: "Uma Events — we received your enquiry",
    text: [
      `Hello ${enquiry.name},`,
      "",
      "Uma Events has received your enquiry. The studio will be in touch.",
      "",
      enquiryBody(enquiry),
    ].join("\n"),
  });

  return { adminSent: true as const, customerSent: true as const };
}
