/**
 * Design-target event imagery supplied with the cinematic reference.
 * CMS hero / project / service media always takes precedence when present.
 */
export const DESIGN_FILM = "/visual/film.mp4";

export const DESIGN_STILLS = [
  { src: "/visual/still-01.jpg", label: "Floral mandapam" },
  { src: "/visual/still-04.jpg", label: "Traditional gold stage" },
  { src: "/visual/still-07.jpg", label: "Corporate staging" },
  { src: "/visual/still-09.jpg", label: "Birthday celebration" },
  { src: "/visual/still-03.jpg", label: "Entrance décor" },
  { src: "/visual/still-02.jpg", label: "White pavilion stage" },
  { src: "/visual/still-08.jpg", label: "Processional arch" },
  { src: "/visual/still-06.jpg", label: "Temple pavilion" },
  { src: "/visual/still-10.jpg", label: "Celebration floor" },
] as const;

export const DESIGN_QUOTE_STILL = "/visual/still-05.jpg";
export const DESIGN_CRAFT_STILL = "/visual/still-08.jpg";
export const DESIGN_HERO_POSTER = "/visual/still-02.jpg";

export function cmsOrVisual(cms: string | null | undefined, visual: string) {
  return cms && cms.trim() ? cms : visual;
}
