import type { Service } from "@/types";
import { serviceKind, type ServiceKind } from "@/lib/public/service-kind";

export type ServiceIdentity = {
  kind: Exclude<ServiceKind, "default">;
  slug: string;
  title: string;
  illustration: string;
};

/** Original Uma Events service visual identities — illustrations only, not CMS records. */
export const SERVICE_IDENTITIES: ServiceIdentity[] = [
  { kind: "wedding", slug: "wedding", title: "Wedding", illustration: "/visual/services/wedding.webp" },
  { kind: "birthday", slug: "birthday", title: "Birthday Party", illustration: "/visual/services/birthday.webp" },
  { kind: "corporate", slug: "corporate", title: "Corporate Events", illustration: "/visual/services/corporate.webp" },
  { kind: "kitty", slug: "kitty-party", title: "Kitty Party", illustration: "/visual/services/kitty-party.webp" },
  { kind: "sangeet", slug: "sangeet", title: "Sangeet Event", illustration: "/visual/services/sangeet.webp" },
  { kind: "mehendi", slug: "mehndi", title: "Mehndi Event", illustration: "/visual/services/mehndi.webp" },
  { kind: "housewarming", slug: "housewarming", title: "House Warming", illustration: "/visual/services/housewarming.webp" },
  { kind: "babyshower", slug: "baby-shower", title: "Baby Shower", illustration: "/visual/services/baby-shower.webp" },
];

export const SERVICE_ILLUSTRATION: Record<Exclude<ServiceKind, "default">, string> = Object.fromEntries(
  SERVICE_IDENTITIES.map((item) => [item.kind, item.illustration]),
) as Record<Exclude<ServiceKind, "default">, string>;

export function illustrationForKind(kind: ServiceKind): string | null {
  if (kind === "default") return null;
  return SERVICE_ILLUSTRATION[kind];
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
      photo: null,
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
      photo: service.image_url,
      illustration: illustrationForKind(kind),
      fromCms: true,
    };
  });
}
