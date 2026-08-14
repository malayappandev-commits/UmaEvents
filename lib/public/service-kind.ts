/** Maps CMS service title/category onto a visual identity slot for future cinematic transitions. */
export type ServiceKind =
  | "wedding"
  | "sangeet"
  | "mehendi"
  | "birthday"
  | "corporate"
  | "kitty"
  | "housewarming"
  | "babyshower"
  | "default";

export function serviceKind(title?: string | null, category?: string | null): ServiceKind {
  const hay = `${title || ""} ${category || ""}`.toLowerCase();
  if (/sangeet/.test(hay)) return "sangeet";
  if (/mehendi|mehndi|henna/.test(hay)) return "mehendi";
  if (/baby\s*shower/.test(hay)) return "babyshower";
  if (/house\s*warming|griha|gruhapravesh|grihapravesh/.test(hay)) return "housewarming";
  if (/kitty/.test(hay)) return "kitty";
  if (/corporate|branded|launch|conference/.test(hay)) return "corporate";
  if (/birthday|bday/.test(hay)) return "birthday";
  if (/wedding|marriage|mandap|reception|engagement/.test(hay)) return "wedding";
  return "default";
}
