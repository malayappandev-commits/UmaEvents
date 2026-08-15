export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "";
  const candidate = !raw
    ? "http://localhost:3000"
    : /^https?:\/\//i.test(raw)
      ? raw
      : `https://${raw}`;
  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    // Invalid NEXT_PUBLIC_SITE_URL must not crash generateMetadata during /_not-found prerender.
    return "http://localhost:3000";
  }
}

export function isVideoMime(mime: string) {
  return mime.startsWith("video/");
}

export function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

/** Watch Live only for real http(s) URLs — not empty strings or arbitrary text. */
export function isPublicLiveUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
