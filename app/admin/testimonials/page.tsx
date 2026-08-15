import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";
import type { Testimonial } from "@/types";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from("testimonials").select("*").order("display_order");
  return (
    <div>
      <h1 className="font-serif text-4xl">Testimonials</h1>
      <p className="mt-2 text-sm text-admin-muted">
        Only published testimonials appear on the homepage. Do not invent quotes.
      </p>
      {error ? <p className="mt-6 text-sm text-red-300">{error.message}</p> : null}
      <TestimonialsManager testimonials={(data ?? []) as Testimonial[]} />
    </div>
  );
}
