import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { WhyChooseUsManager } from "@/components/admin/home-cms-managers";
import type { WhyChooseUsItem } from "@/types";

export const metadata: Metadata = { title: "Why choose us" };

export default async function WhyChooseUsPage() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from("why_choose_us_items").select("*").order("display_order");
  return (
    <div>
      <h1 className="font-serif text-4xl">Why choose us</h1>
      <p className="mt-2 text-sm text-admin-muted">Published items appear on the homepage. Leave empty if none exist.</p>
      {error ? <p className="mt-6 text-sm text-red-300">{error.message}</p> : null}
      <WhyChooseUsManager items={(data ?? []) as WhyChooseUsItem[]} />
    </div>
  );
}
