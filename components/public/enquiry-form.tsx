"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { enquirySchema } from "@/lib/validations/enquiry";

export function EnquiryForm({
  projectId,
  eventTypes,
  tone = "light",
}: {
  projectId?: string;
  eventTypes: string[];
  tone?: "light" | "dark";
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setStatus("submitting");
    setError("");
    const raw = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      event_type: String(formData.get("event_type") || ""),
      event_date: String(formData.get("event_date") || "") || null,
      location: String(formData.get("location") || ""),
      guest_count: formData.get("guest_count") ? Number(formData.get("guest_count")) : null,
      budget: String(formData.get("budget") || "") || null,
      message: String(formData.get("message") || ""),
      project_id: projectId || null,
    };
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message || "Please check the form");
      return;
    }
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("enquiries").insert({
        ...parsed.data,
        event_date: parsed.data.event_date || null,
        guest_count: parsed.data.guest_count || null,
        budget: parsed.data.budget || null,
        project_id: parsed.data.project_id || null,
        status: "NEW",
      });
      if (insertError) throw insertError;
      setStatus("done");
      router.refresh();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Could not send enquiry");
    }
  }

  if (status === "done") {
    return (
      <div className={tone === "dark" ? "border border-gold/35 bg-white/5 px-8 py-12 text-center text-ivory" : "border border-gold/40 bg-cream/50 px-8 py-12 text-center"}>
        <p className="font-serif text-3xl">Thank you</p>
        <p className={tone === "dark" ? "mt-3 text-sm text-ivory/70" : "mt-3 text-sm text-charcoal/70"}>
          Your enquiry has been received. The Uma Events team will be in touch.
        </p>
      </div>
    );
  }

  const field = tone === "dark" ? "uma-field uma-field--dark" : "uma-field";

  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      <input name="name" required placeholder="Name" className={field} />
      <input name="email" type="email" required placeholder="Email" className={field} />
      <input name="phone" required placeholder="Phone" className={field} />
      <select name="event_type" className={field} defaultValue="">
        <option value="">Event type</option>
        {eventTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
        <option value="Wedding">Wedding</option>
        <option value="Engagement">Engagement</option>
        <option value="Reception">Reception</option>
        <option value="Birthday">Birthday</option>
        <option value="Corporate">Corporate</option>
        <option value="Other">Other</option>
      </select>
      <input name="event_date" type="date" className={field} />
      <input name="location" placeholder="Location" className={field} />
      <input name="guest_count" type="number" min={1} placeholder="Guest count" className={field} />
      <input name="budget" placeholder="Budget (optional)" className={field} />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Tell us about the gathering"
        className={`${field} md:col-span-2`}
      />
      {error ? (
        <p className={tone === "dark" ? "md:col-span-2 text-sm text-red-200" : "md:col-span-2 text-sm text-red-800"}>
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="uma-btn uma-btn-primary md:col-span-2 disabled:opacity-60"
      >
        <span>{status === "submitting" ? "Sending…" : "Send enquiry"}</span>
        <span className="uma-btn-arrow" aria-hidden>
          →
        </span>
      </button>
    </form>
  );
}
