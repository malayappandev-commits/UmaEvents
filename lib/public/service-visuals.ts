import type { Service } from "@/types";
import { serviceKind, type ServiceKind } from "@/lib/public/service-kind";
import { DESIGN_STILLS } from "@/lib/public/design-visuals";

export type ServiceIdentity = {
  kind: Exclude<ServiceKind, "default">;
  slug: string;
  title: string;
  illustration: string;
  atmosphere: string;
};

/** Original Uma Events service identities. Illustrations are chapter transitions, not cards. */
export const SERVICE_IDENTITIES: ServiceIdentity[] = [
  {
    kind: "wedding",
    slug: "wedding",
    title: "Wedding",
    illustration: "/visual/services/wedding.webp",
    atmosphere: DESIGN_STILLS[0].src,
  },
  {
    kind: "birthday",
    slug: "birthday",
    title: "Birthday Party",
    illustration: "/visual/services/birthday.webp",
    atmosphere: DESIGN_STILLS[3].src,
  },
  {
    kind: "corporate",
    slug: "corporate",
    title: "Corporate Events",
    illustration: "/visual/services/corporate.webp",
    atmosphere: DESIGN_STILLS[2].src,
  },
  {
    kind: "kitty",
    slug: "kitty-party",
    title: "Kitty Party",
    illustration: "/visual/services/kitty-party.webp",
    atmosphere: DESIGN_STILLS[8].src,
  },
  {
    kind: "sangeet",
    slug: "sangeet",
    title: "Sangeet Event",
    illustration: "/visual/services/sangeet.webp",
    atmosphere: DESIGN_STILLS[1].src,
  },
  {
    kind: "mehendi",
    slug: "mehndi",
    title: "Mehndi Event",
    illustration: "/visual/services/mehndi.webp",
    atmosphere: DESIGN_STILLS[6].src,
  },
  {
    kind: "housewarming",
    slug: "house-warming",
    title: "House Warming",
    illustration: "/visual/services/housewarming.webp",
    atmosphere: DESIGN_STILLS[4].src,
  },
  {
    kind: "babyshower",
    slug: "baby-shower",
    title: "Baby Shower",
    illustration: "/visual/services/baby-shower.webp",
    atmosphere: DESIGN_STILLS[5].src,
  },
];

const SLUG_ALIASES: Record<string, string> = {
  wedding: "wedding",
  birthday: "birthday",
  corporate: "corporate",
  kitty: "kitty-party",
  "kitty-party": "kitty-party",
  sangeet: "sangeet",
  mehndi: "mehndi",
  mehendi: "mehndi",
  housewarming: "house-warming",
  "house-warming": "house-warming",
  "baby-shower": "baby-shower",
  babyshower: "baby-shower",
};

export function identityBySlug(slug: string): ServiceIdentity | null {
  const key = SLUG_ALIASES[slug.trim().toLowerCase()];
  if (!key) return null;
  return SERVICE_IDENTITIES.find((item) => item.slug === key) ?? null;
}

export type CraftedService = {
  key: string;
  kind: ServiceKind;
  slug: string;
  title: string;
  description: string | null;
  photo: string | null;
  illustration: string | null;
  fromCms: boolean;
};

const FALLBACK_LINE = "Planned according to the brief — not as a package.";

export function craftServices(published: Service[]): CraftedService[] {
  if (!published.length) {
    return SERVICE_IDENTITIES.map((identity) => ({
      key: identity.slug,
      kind: identity.kind,
      slug: identity.slug,
      title: identity.title,
      description: FALLBACK_LINE,
      photo: identity.atmosphere,
      illustration: identity.illustration,
      fromCms: false,
    }));
  }

  return published.map((service) => {
    const kind = serviceKind(service.title, service.category);
    const identity = SERVICE_IDENTITIES.find((item) => item.kind === kind);
    return {
      key: service.id,
      kind,
      slug: identity?.slug || service.id,
      title: service.title,
      description: service.short_description || FALLBACK_LINE,
      photo: service.image_url || identity?.atmosphere || null,
      illustration: identity?.illustration || null,
      fromCms: true,
    };
  });
}

export function matchPublishedService(published: Service[], identity: ServiceIdentity) {
  return published.find((service) => serviceKind(service.title, service.category) === identity.kind) ?? null;
}
