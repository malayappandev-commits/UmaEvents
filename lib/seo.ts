import type { Metadata } from "next";
import { siteUrl } from "@/lib/utils";
import type { StudioSettings } from "@/types";

export function defaultMetadata(settings: StudioSettings | null): Metadata {
  const title = settings?.seo_title || settings?.studio_name || "Uma Events";
  const description =
    settings?.seo_description ||
    "Uma Events is an event management and planning studio in Vijayawada, Andhra Pradesh.";
  const url = siteUrl();
  const ogImage = settings?.hero_image_url || undefined;

  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s · ${settings?.studio_name || "Uma Events"}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: settings?.studio_name || "Uma Events",
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: { canonical: url },
  };
}

export function jsonLdLocalBusiness(settings: StudioSettings | null) {
  return {
    "@context": "https://schema.org",
    "@type": "EventPlanner",
    name: settings?.studio_name || "Uma Events",
    description: settings?.seo_description,
    url: siteUrl(),
    telephone: settings?.phone || undefined,
    email: settings?.contact_email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address || undefined,
      addressLocality: "Vijayawada",
      addressRegion: "Andhra Pradesh",
      addressCountry: "IN",
    },
    areaServed: settings?.locations?.length ? settings.locations : ["Vijayawada"],
    sameAs: [settings?.instagram_url, settings?.facebook_url, settings?.youtube_url].filter(
      Boolean,
    ),
  };
}
