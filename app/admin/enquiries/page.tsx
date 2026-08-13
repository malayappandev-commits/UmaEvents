import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { EnquiriesBoard } from "@/components/admin/enquiries-board";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="font-serif text-4xl">Enquiries</h1>
      <EnquiriesBoard enquiries={data ?? []} />
    </div>
  );
}
