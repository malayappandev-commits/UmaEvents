import Link from "next/link";
import { getSettings } from "@/lib/queries/public";
import { PUBLIC_NAV, BRAND_NAME } from "@/lib/public/nav";
import { GoldLine } from "@/components/public/ui";

export async function PublicFooter() {
  let settings = null;
  try {
    settings = await getSettings();
  } catch {
    settings = null;
  }
  const name = settings?.studio_name || "Uma Events";

  return (
    <footer className="uma-footer">
      <GoldLine />
      <div className="uma-footer-grid">
        <div>
          <p className="uma-footer-mark">{BRAND_NAME}</p>
          <p className="uma-footer-tagline">
            {settings?.tagline || "Event management and planning from Vijayawada — celebrations composed with care."}
          </p>
        </div>
        <div className="uma-footer-meta">
          <p className="uma-eyebrow uma-eyebrow--gold">Studio</p>
          <p className="mt-3">{settings?.address || "Vijayawada, Andhra Pradesh"}</p>
          {settings?.phone ? <p className="mt-2">{settings.phone}</p> : null}
          {settings?.contact_email ? (
            <a className="mt-2 block hover:text-gold" href={`mailto:${settings.contact_email}`}>
              {settings.contact_email}
            </a>
          ) : null}
        </div>
        <div className="uma-footer-links">
          {PUBLIC_NAV.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="uma-footer-login">
            Studio login
          </Link>
          <div className="uma-footer-social">
            {settings?.instagram_url ? (
              <a href={settings.instagram_url} target="_blank" rel="noreferrer">
                Instagram
              </a>
            ) : null}
            {settings?.facebook_url ? (
              <a href={settings.facebook_url} target="_blank" rel="noreferrer">
                Facebook
              </a>
            ) : null}
            {settings?.youtube_url ? (
              <a href={settings.youtube_url} target="_blank" rel="noreferrer">
                YouTube
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <p className="uma-footer-copy">
        {name} · Vijayawada
      </p>
    </footer>
  );
}
