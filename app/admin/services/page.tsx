import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { ServicesManager } from "@/components/admin/services-manager";

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("services").select("*").order("display_order");
  return (
    <div>
      <h1 className="font-serif text-4xl">Services</h1>
      <p className="mt-2 text-sm text-admin-muted">Capabilities, not packages. Unpublished items stay off the public site.</p>
      <ServicesManager services={data ?? []} />
    </div>
  );
}
