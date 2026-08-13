import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } from "@/lib/constants";

export function mediaFolder(type: "PHOTO" | "VIDEO") {
  return type === "VIDEO" ? "videos" : "photos";
}

export function buildStoragePath(projectId: string, type: "PHOTO" | "VIDEO", filename: string) {
  const safe = filename.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 180);
  const id = crypto.randomUUID();
  return `${projectId}/${mediaFolder(type)}/${id}-${safe}`;
}

export function detectMediaType(mime: string): "PHOTO" | "VIDEO" | null {
  if (ALLOWED_VIDEO_TYPES.includes(mime)) return "VIDEO";
  if (ALLOWED_IMAGE_TYPES.includes(mime)) return "PHOTO";
  return null;
}

export function isAllowedMime(mime: string) {
  return detectMediaType(mime) !== null;
}
