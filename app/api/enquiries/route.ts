import { NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { supabaseConfigured } from "@/lib/supabase/env";
import { enquirySchema } from "@/lib/validations/enquiry";
import { sendEnquiryNotification } from "@/lib/email";

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid enquiry" }, { status: 400 });
  }

  const supabase = createAnonClient();
  const { error } = await supabase.from("enquiries").insert({
    ...parsed.data,
    event_date: parsed.data.event_date || null,
    guest_count: parsed.data.guest_count || null,
    budget: parsed.data.budget || null,
    project_id: parsed.data.project_id || null,
    status: "NEW",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let emailSent = false;
  try {
    const result = await sendEnquiryNotification(parsed.data);
    emailSent = result.sent;
  } catch {
    emailSent = false;
  }

  return NextResponse.json({ ok: true, emailSent });
}
