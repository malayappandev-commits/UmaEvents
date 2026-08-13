export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/heic",
  "image/heif",
];

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
];

export const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export const STAFF_ROLES = ["OWNER", "ADMIN"] as const;
export const ALL_ROLES = ["OWNER", "ADMIN", "EMPLOYEE"] as const;

export const ENQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export const MEDIA_PAGE_SIZE = 48;
export const PORTFOLIO_PAGE_SIZE = 18;
