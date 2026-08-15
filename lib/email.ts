import nodemailer from "nodemailer";
import type { EnquiryInput } from "@/lib/validations/enquiry";

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export async function sendEnquiryNotification(enquiry: EnquiryInput) {
  if (!smtpConfigured()) return { sent: false as const, reason: "smtp-not-configured" };

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  const to = process.env.SMTP_TO || process.env.SMTP_FROM;
  const subject = `Uma Events enquiry${enquiry.event_type ? ` — ${enquiry.event_type}` : ""}`;
  const text = [
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

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    replyTo: enquiry.email,
    subject,
    text,
  });

  return { sent: true as const };
}
