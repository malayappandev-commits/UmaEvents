-- Functional information architecture: service slugs, galleries, ratings,
-- testimonials, milestones, notifications, and about/home CMS fields.
-- No invented public content is seeded as published.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(both '-' from regexp_replace(
      regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'),
      '-+', '-', 'g'
    )),
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- Services: slug + offerings list for the reusable detail page
-- ---------------------------------------------------------------------------

alter table public.services
  add column if not exists slug text,
  add column if not exists offerings text[] not null default '{}',
  add column if not exists long_description text not null default '';

update public.services
set slug = coalesce(public.slugify(title), replace(id::text, '-', ''))
where slug is null or slug = '';

-- Guarantee uniqueness if titles collide
update public.services s
set slug = s.slug || '-' || substr(s.id::text, 1, 8)
where exists (
  select 1 from public.services o
  where o.slug = s.slug and o.id < s.id
);

alter table public.services
  alter column slug set not null;

create unique index if not exists services_slug_idx on public.services (slug);

-- Align unpublished catalogue slugs with the intended dynamic routes.
update public.services set slug = 'wedding' where title = 'Wedding Events' and slug is distinct from 'wedding'
  and not exists (select 1 from public.services x where x.slug = 'wedding' and x.id <> services.id);
update public.services set slug = 'birthday' where title = 'Birthday Celebrations' and slug is distinct from 'birthday'
  and not exists (select 1 from public.services x where x.slug = 'birthday' and x.id <> services.id);
update public.services set slug = 'corporate-events' where title = 'Corporate Events' and slug is distinct from 'corporate-events'
  and not exists (select 1 from public.services x where x.slug = 'corporate-events' and x.id <> services.id);

insert into public.services (title, slug, short_description, category, display_order, published)
select v.title, v.slug, v.short_description, v.category, v.display_order, false
from (
  values
    ('Sangeet', 'sangeet', 'Sangeet evenings planned around music, sequence, and guest energy.', 'Weddings', 22),
    ('Mehendi', 'mehendi', 'Mehendi gatherings styled for colour, comfort, and celebration.', 'Weddings', 24),
    ('Baby Shower', 'baby-shower', 'Baby shower hosting and production, planned to the family brief.', 'Celebrations', 42),
    ('Housewarming', 'housewarming', 'Housewarming ceremonies and gatherings, held with care.', 'Celebrations', 44),
    ('Kitty Party', 'kitty-party', 'Hosted kitty parties and social evenings.', 'Celebrations', 46)
) as v(title, slug, short_description, category, display_order)
where not exists (select 1 from public.services s where s.slug = v.slug);

-- ---------------------------------------------------------------------------
-- Projects: live stream URL + remarkable milestone flags
-- ---------------------------------------------------------------------------

alter table public.projects
  add column if not exists live_url text,
  add column if not exists is_milestone boolean not null default false,
  add column if not exists milestone_order integer not null default 0,
  add column if not exists milestone_description text not null default '';

create index if not exists projects_milestone_idx
  on public.projects (is_milestone, published, milestone_order);

-- ---------------------------------------------------------------------------
-- Studio settings: about sections + brand quotation
-- ---------------------------------------------------------------------------

alter table public.studio_settings
  add column if not exists brand_quotation text not null default '',
  add column if not exists who_we_are text not null default '',
  add column if not exists why_trust_us text not null default '',
  add column if not exists founder_and_team text not null default '',
  add column if not exists collaborations text not null default '';

update public.studio_settings
set
  brand_quotation = case when brand_quotation = '' then tagline else brand_quotation end,
  who_we_are = case when who_we_are = '' then about_intro else who_we_are end
where id = 1;

-- ---------------------------------------------------------------------------
-- Homepage ratings (admin-managed metrics; empty until filled)
-- ---------------------------------------------------------------------------

create table if not exists public.site_ratings (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  caption text not null default '',
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_ratings_published_order_idx
  on public.site_ratings (published, display_order);

drop trigger if exists site_ratings_set_updated_at on public.site_ratings;
create trigger site_ratings_set_updated_at
before update on public.site_ratings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Why choose us
-- ---------------------------------------------------------------------------

create table if not exists public.why_choose_us_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists why_choose_us_published_order_idx
  on public.why_choose_us_items (published, display_order);

drop trigger if exists why_choose_us_items_set_updated_at on public.why_choose_us_items;
create trigger why_choose_us_items_set_updated_at
before update on public.why_choose_us_items
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Testimonials
-- ---------------------------------------------------------------------------

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author_name text not null default '',
  author_role text not null default '',
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_published_order_idx
  on public.testimonials (published, display_order);

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Service gallery media
-- ---------------------------------------------------------------------------

create table if not exists public.service_media (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  type public.media_type not null default 'PHOTO',
  storage_path text not null,
  public_url text,
  filename text not null,
  mime_type text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_media_service_idx on public.service_media (service_id, sort_order);
create unique index if not exists service_media_storage_path_idx on public.service_media (storage_path);

drop trigger if exists service_media_set_updated_at on public.service_media;
create trigger service_media_set_updated_at
before update on public.service_media
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Service ratings / reviews
-- ---------------------------------------------------------------------------

create table if not exists public.service_ratings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  customer_name text not null default '',
  rating integer not null,
  review text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_ratings_rating_range check (rating >= 1 and rating <= 5)
);

create index if not exists service_ratings_service_idx
  on public.service_ratings (service_id, published, created_at desc);

drop trigger if exists service_ratings_set_updated_at on public.service_ratings;
create trigger service_ratings_set_updated_at
before update on public.service_ratings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Main gallery (latest events media)
-- ---------------------------------------------------------------------------

create table if not exists public.gallery_media (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  caption text not null default '',
  uploaded_by uuid references public.profiles (id) on delete set null,
  type public.media_type not null default 'PHOTO',
  storage_path text not null,
  public_url text,
  filename text not null,
  mime_type text not null default '',
  event_date date,
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_media_published_order_idx
  on public.gallery_media (published, display_order, event_date desc);
create unique index if not exists gallery_media_storage_path_idx on public.gallery_media (storage_path);

drop trigger if exists gallery_media_set_updated_at on public.gallery_media;
create trigger gallery_media_set_updated_at
before update on public.gallery_media
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin notifications
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_created_idx on public.notifications (created_at desc);

create or replace function public.tg_notify_enquiry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (title, body, href)
  values (
    'New enquiry',
    trim(both ' — ' from coalesce(new.name, '') || ' — ' || coalesce(new.event_type, '')),
    '/admin/enquiries'
  );
  return new;
end;
$$;

drop trigger if exists enquiries_notify on public.enquiries;
create trigger enquiries_notify
after insert on public.enquiries
for each row execute function public.tg_notify_enquiry();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.site_ratings enable row level security;
alter table public.why_choose_us_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.service_media enable row level security;
alter table public.service_ratings enable row level security;
alter table public.gallery_media enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Public read published site ratings" on public.site_ratings;
create policy "Public read published site ratings"
  on public.site_ratings for select
  using (published = true or public.is_admin_or_owner());
drop policy if exists "Staff manage site ratings insert" on public.site_ratings;
create policy "Staff manage site ratings insert"
  on public.site_ratings for insert with check (public.is_admin_or_owner());
drop policy if exists "Staff manage site ratings update" on public.site_ratings;
create policy "Staff manage site ratings update"
  on public.site_ratings for update using (public.is_admin_or_owner()) with check (public.is_admin_or_owner());
drop policy if exists "Staff manage site ratings delete" on public.site_ratings;
create policy "Staff manage site ratings delete"
  on public.site_ratings for delete using (public.is_admin_or_owner());

drop policy if exists "Public read published why choose us" on public.why_choose_us_items;
create policy "Public read published why choose us"
  on public.why_choose_us_items for select
  using (published = true or public.is_admin_or_owner());
drop policy if exists "Staff manage why choose us insert" on public.why_choose_us_items;
create policy "Staff manage why choose us insert"
  on public.why_choose_us_items for insert with check (public.is_admin_or_owner());
drop policy if exists "Staff manage why choose us update" on public.why_choose_us_items;
create policy "Staff manage why choose us update"
  on public.why_choose_us_items for update using (public.is_admin_or_owner()) with check (public.is_admin_or_owner());
drop policy if exists "Staff manage why choose us delete" on public.why_choose_us_items;
create policy "Staff manage why choose us delete"
  on public.why_choose_us_items for delete using (public.is_admin_or_owner());

drop policy if exists "Public read published testimonials" on public.testimonials;
create policy "Public read published testimonials"
  on public.testimonials for select
  using (published = true or public.is_admin_or_owner());
drop policy if exists "Staff manage testimonials insert" on public.testimonials;
create policy "Staff manage testimonials insert"
  on public.testimonials for insert with check (public.is_admin_or_owner());
drop policy if exists "Staff manage testimonials update" on public.testimonials;
create policy "Staff manage testimonials update"
  on public.testimonials for update using (public.is_admin_or_owner()) with check (public.is_admin_or_owner());
drop policy if exists "Staff manage testimonials delete" on public.testimonials;
create policy "Staff manage testimonials delete"
  on public.testimonials for delete using (public.is_admin_or_owner());

drop policy if exists "Public read published service media" on public.service_media;
create policy "Public read published service media"
  on public.service_media for select
  using (
    public.is_admin_or_owner()
    or (
      published = true
      and exists (
        select 1 from public.services s
        where s.id = service_media.service_id and s.published = true
      )
    )
  );
drop policy if exists "Staff manage service media insert" on public.service_media;
create policy "Staff manage service media insert"
  on public.service_media for insert with check (public.is_admin_or_owner());
drop policy if exists "Staff manage service media update" on public.service_media;
create policy "Staff manage service media update"
  on public.service_media for update using (public.is_admin_or_owner()) with check (public.is_admin_or_owner());
drop policy if exists "Staff manage service media delete" on public.service_media;
create policy "Staff manage service media delete"
  on public.service_media for delete using (public.is_admin_or_owner());

drop policy if exists "Public read published service ratings" on public.service_ratings;
create policy "Public read published service ratings"
  on public.service_ratings for select
  using (
    public.is_admin_or_owner()
    or (
      published = true
      and exists (
        select 1 from public.services s
        where s.id = service_ratings.service_id and s.published = true
      )
    )
  );
drop policy if exists "Staff manage service ratings insert" on public.service_ratings;
create policy "Staff manage service ratings insert"
  on public.service_ratings for insert with check (public.is_admin_or_owner());
drop policy if exists "Staff manage service ratings update" on public.service_ratings;
create policy "Staff manage service ratings update"
  on public.service_ratings for update using (public.is_admin_or_owner()) with check (public.is_admin_or_owner());
drop policy if exists "Staff manage service ratings delete" on public.service_ratings;
create policy "Staff manage service ratings delete"
  on public.service_ratings for delete using (public.is_admin_or_owner());

drop policy if exists "Public read published gallery media" on public.gallery_media;
create policy "Public read published gallery media"
  on public.gallery_media for select
  using (published = true or public.is_admin_or_owner());
drop policy if exists "Staff manage gallery media insert" on public.gallery_media;
create policy "Staff manage gallery media insert"
  on public.gallery_media for insert with check (public.is_admin_or_owner());
drop policy if exists "Staff manage gallery media update" on public.gallery_media;
create policy "Staff manage gallery media update"
  on public.gallery_media for update using (public.is_admin_or_owner()) with check (public.is_admin_or_owner());
drop policy if exists "Staff manage gallery media delete" on public.gallery_media;
create policy "Staff manage gallery media delete"
  on public.gallery_media for delete using (public.is_admin_or_owner());

drop policy if exists "Staff read notifications" on public.notifications;
create policy "Staff read notifications"
  on public.notifications for select
  using (public.is_admin_or_owner());
drop policy if exists "Staff update notifications" on public.notifications;
create policy "Staff update notifications"
  on public.notifications for update
  using (public.is_admin_or_owner())
  with check (public.is_admin_or_owner());
drop policy if exists "Staff delete notifications" on public.notifications;
create policy "Staff delete notifications"
  on public.notifications for delete
  using (public.is_admin_or_owner());
drop policy if exists "System insert notifications" on public.notifications;
create policy "System insert notifications"
  on public.notifications for insert
  with check (public.is_admin_or_owner() or auth.uid() is null);

grant select on public.site_ratings, public.why_choose_us_items, public.testimonials,
  public.service_media, public.service_ratings, public.gallery_media to anon;
grant select, insert, update, delete on public.site_ratings, public.why_choose_us_items,
  public.testimonials, public.service_media, public.service_ratings, public.gallery_media,
  public.notifications to authenticated;
grant all on public.site_ratings, public.why_choose_us_items, public.testimonials,
  public.service_media, public.service_ratings, public.gallery_media, public.notifications
  to postgres, service_role;
