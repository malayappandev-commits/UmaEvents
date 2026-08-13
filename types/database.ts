export type UserRole = "OWNER" | "ADMIN" | "EMPLOYEE";
export type ProfileStatus = "ACTIVE" | "DISABLED";
export type MediaType = "PHOTO" | "VIDEO";
export type MediaStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  status: ProfileStatus;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  event_type: string;
  location: string;
  event_date: string | null;
  description: string;
  cover_media_id: string | null;
  featured: boolean;
  published: boolean;
  client_name: string | null;
  show_client_publicly: boolean;
  photographer: string | null;
  videographer: string | null;
  guest_count: number | null;
  event_highlights: string[];
  created_at: string;
  updated_at: string;
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  assigned_by: string | null;
  assigned_at: string;
};

export type Media = {
  id: string;
  project_id: string;
  uploaded_by: string | null;
  type: MediaType;
  storage_path: string;
  public_url: string | null;
  thumbnail_url: string | null;
  filename: string;
  mime_type: string;
  size_bytes: number;
  duration: number | null;
  sort_order: number;
  is_cover: boolean;
  status: MediaStatus;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  title: string;
  short_description: string;
  image_url: string | null;
  category: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string | null;
  location: string;
  guest_count: number | null;
  budget: string | null;
  message: string;
  project_id: string | null;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
};

export type StudioSettings = {
  id: number;
  studio_name: string;
  contact_email: string;
  phone: string;
  address: string;
  locations: string[];
  tagline: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_image_url: string | null;
  hero_video_url: string | null;
  about_intro: string;
  about_story: string;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ProjectWithCover = Project & {
  cover: Media | null;
  media_count?: number;
};
