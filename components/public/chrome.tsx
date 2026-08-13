import Link from "next/link";
import { getSettings } from "@/lib/queries/public";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export async function PublicHeader() {
  let name = "Uma Events";
  try {
    const settings = await getSettings();
    name = settings?.studio_name || name;
  } catch {
    /* settings unavailable until Supabase is configured */
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" className="font-serif text-xl tracking-[0.18em] text-ivory uppercase">
          {name}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[11px] tracking-[0.28em] text-ivory/80 uppercase transition hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="border border-gold/50 px-4 py-2 text-[10px] tracking-[0.28em] text-ivory uppercase transition hover:border-gold hover:bg-gold/10"
        >
          Enquire
        </Link>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-6 pb-4 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="shrink-0 text-[10px] tracking-[0.22em] text-ivory/70 uppercase"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export async function PublicFooter() {
  let settings = null;
  try {
    settings = await getSettings();
  } catch {
    settings = null;
  }
  const name = settings?.studio_name || "Uma Events";

  return (
    <footer className="bg-ink text-ivory">
      <div className="gold-rule" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3 md:px-10">
        <div>
          <p className="font-serif text-3xl">{name}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/60">
            {settings?.tagline || "Event management and planning from Vijayawada."}
          </p>
        </div>
        <div className="text-sm text-ivory/70">
          <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Studio</p>
          <p className="mt-3">{settings?.address || "Vijayawada, Andhra Pradesh"}</p>
          {settings?.phone ? <p className="mt-2">{settings.phone}</p> : null}
          {settings?.contact_email ? (
            <a className="mt-2 block hover:text-gold" href={`mailto:${settings.contact_email}`}>
              {settings.contact_email}
            </a>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 text-[11px] tracking-[0.22em] uppercase">
          <Link href="/services" className="hover:text-gold">
            Services
          </Link>
          <Link href="/portfolio" className="hover:text-gold">
            Selected events
          </Link>
          <Link href="/contact" className="hover:text-gold">
            Enquire
          </Link>
          <Link href="/login" className="text-ivory/40 hover:text-ivory/70">
            Studio login
          </Link>
          <div className="mt-4 flex gap-4 text-ivory/50">
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
      <p className="px-6 pb-8 text-center text-[11px] tracking-[0.18em] text-ivory/30 uppercase">
        {name} · Vijayawada
      </p>
    </footer>
  );
}
