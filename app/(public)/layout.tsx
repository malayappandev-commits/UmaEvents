import { SiteNav } from "@/components/public/site-nav";
import { PublicFooter } from "@/components/public/chrome";
import { SiteIntro } from "@/components/public/site-intro";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="uma-public min-h-screen">
      <SiteIntro />
      <SiteNav />
      {children}
      <PublicFooter />
    </div>
  );
}
