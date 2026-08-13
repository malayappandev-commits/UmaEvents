import { getSettings } from "@/lib/queries/public";
import { SiteNav } from "@/components/public/site-nav";
import { PublicFooter } from "@/components/public/chrome";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let name = "Uma Events";
  try {
    const settings = await getSettings();
    name = settings?.studio_name || name;
  } catch {
    /* ignore */
  }

  return (
    <div className="min-h-screen bg-ivory">
      <SiteNav studioName={name} />
      {children}
      <PublicFooter />
    </div>
  );
}
