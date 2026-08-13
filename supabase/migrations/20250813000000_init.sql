-- Uma Events — schema, indexes, RLS, storage, and seed settings
-- Reproducible from this repository. Do not rely on dashboard-only tables.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('OWNER', 'ADMIN', 'EMPLOYEE');
create type public.profile_status as enum ('ACTIVE', 'DISABLED');
create type public.media_type as enum ('PHOTO', 'VIDEO');
create type public.media_status as enum ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');
create type public.enquiry_status as enum ('NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- ---------------------------------------------------------------------------
-- Updated-at helper
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role public.user_role not null default 'EMPLOYEE',
  avatar_url text,
  status public.profile_status not null default 'ACTIVE',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_status_idx on public.profiles (status);
create index profiles_email_idx on public.profiles (email);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- New auth users always become EMPLOYEE. Role is never taken from client metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    'EMPLOYEE'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  event_type text not null default '',
  location text not null default '',
  event_date date,
  description text not null default '',
  cover_media_id uuid,
  featured boolean not null default false,
  published boolean not null default false,
  client_name text,
  show_client_publicly boolean not null default false,
  photographer text,
  videographer text,
  guest_count integer,
  event_highlights text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guest_count_non_negative check (guest_count is null or guest_count >= 0)
);

create index projects_published_idx on public.projects (published);
create index projects_featured_idx on public.projects (featured);
create index projects_event_type_idx on public.projects (event_type);
create index projects_event_date_idx on public.projects (event_date desc);
create index projects_slug_idx on public.projects (slug);

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Project members
-- ---------------------------------------------------------------------------

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  assigned_by uuid references public.profiles (id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index project_members_user_idx on public.project_members (user_id);
create index project_members_project_idx on public.project_members (project_id);

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------

create table public.media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  type public.media_type not null,
  storage_path text not null unique,
  public_url text,
  thumbnail_url text,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  duration numeric,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  status public.media_status not null default 'UPLOADING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_size_non_negative check (size_bytes >= 0)
);

create index media_project_idx on public.media (project_id);
create index media_uploaded_by_idx on public.media (uploaded_by);
create index media_type_idx on public.media (type);
create index media_status_idx on public.media (status);
create index media_project_sort_idx on public.media (project_id, sort_order);
create index media_created_idx on public.media (created_at desc);

create trigger media_set_updated_at
before update on public.media
for each row execute function public.set_updated_at();

alter table public.projects
  add constraint projects_cover_media_fk
  foreign key (cover_media_id) references public.media (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_description text not null default '',
  image_url text,
  category text not null default '',
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_published_order_idx on public.services (published, display_order);

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------------

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  event_type text not null default '',
  event_date date,
  location text not null default '',
  guest_count integer,
  budget text,
  message text not null default '',
  project_id uuid references public.projects (id) on delete set null,
  status public.enquiry_status not null default 'NEW',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enquiries_status_idx on public.enquiries (status);
create index enquiries_created_idx on public.enquiries (created_at desc);
create index enquiries_project_idx on public.enquiries (project_id);

create trigger enquiries_set_updated_at
before update on public.enquiries
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Studio settings (singleton)
-- ---------------------------------------------------------------------------

create table public.studio_settings (
  id integer primary key default 1 check (id = 1),
  studio_name text not null default 'Uma Events',
  contact_email text not null default '',
  phone text not null default '',
  address text not null default '',
  locations text[] not null default '{}',
  tagline text not null default '',
  hero_headline text not null default 'We create moments worth remembering.',
  hero_subheadline text not null default '',
  hero_image_url text,
  hero_video_url text,
  about_intro text not null default '',
  about_story text not null default '',
  instagram_url text,
  facebook_url text,
  youtube_url text,
  seo_title text not null default 'Uma Events',
  seo_description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger studio_settings_set_updated_at
before update on public.studio_settings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Activity
-- ---------------------------------------------------------------------------

create table public.activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_created_idx on public.activity (created_at desc);
create index activity_actor_idx on public.activity (actor_id);
create index activity_entity_idx on public.activity (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Auth helpers (security definer to avoid RLS recursion)
-- ---------------------------------------------------------------------------

create or replace function public.current_profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and status = 'ACTIVE'
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'OWNER'
      and status = 'ACTIVE'
  )
$$;

create or replace function public.is_admin_or_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('OWNER', 'ADMIN')
      and status = 'ACTIVE'
  )
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'ACTIVE'
  )
$$;

create or replace function public.is_assigned_to_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project_id
      and user_id = auth.uid()
  )
$$;

create or replace function public.can_access_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin_or_owner()
    or public.is_assigned_to_project(p_project_id)
    or exists (
      select 1 from public.projects
      where id = p_project_id
        and published = true
    )
$$;

-- ---------------------------------------------------------------------------
-- Activity logging
-- ---------------------------------------------------------------------------

create or replace function public.log_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

create or replace function public.tg_log_project_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_activity('project_created', 'project', new.id, jsonb_build_object('title', new.title));
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.published is distinct from old.published then
      perform public.log_activity(
        case when new.published then 'project_published' else 'project_unpublished' end,
        'project',
        new.id,
        jsonb_build_object('title', new.title)
      );
    elsif new.featured is distinct from old.featured then
      perform public.log_activity('project_featured', 'project', new.id, jsonb_build_object('featured', new.featured));
    else
      perform public.log_activity('project_updated', 'project', new.id, jsonb_build_object('title', new.title));
    end if;
    return new;
  end if;

  return new;
end;
$$;

create trigger projects_activity
after insert or update on public.projects
for each row execute function public.tg_log_project_activity();

create or replace function public.tg_log_member_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_activity('employee_assigned', 'project_member', new.id, jsonb_build_object('project_id', new.project_id, 'user_id', new.user_id));
    return new;
  end if;
  if tg_op = 'DELETE' then
    perform public.log_activity('employee_removed', 'project_member', old.id, jsonb_build_object('project_id', old.project_id, 'user_id', old.user_id));
    return old;
  end if;
  return null;
end;
$$;

create trigger project_members_activity
after insert or delete on public.project_members
for each row execute function public.tg_log_member_activity();

create or replace function public.tg_log_media_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_activity('media_uploaded', 'media', new.id, jsonb_build_object('project_id', new.project_id, 'filename', new.filename));
    return new;
  end if;
  if tg_op = 'DELETE' then
    perform public.log_activity('media_deleted', 'media', old.id, jsonb_build_object('project_id', old.project_id, 'filename', old.filename));
    return old;
  end if;
  return null;
end;
$$;

create trigger media_activity
after insert or delete on public.media
for each row execute function public.tg_log_media_activity();

create or replace function public.tg_log_enquiry_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_activity('enquiry_created', 'enquiry', new.id, jsonb_build_object('event_type', new.event_type));
    return new;
  end if;
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform public.log_activity('enquiry_status_changed', 'enquiry', new.id, jsonb_build_object('from', old.status, 'to', new.status));
    return new;
  end if;
  return new;
end;
$$;

create trigger enquiries_activity
after insert or update on public.enquiries
for each row execute function public.tg_log_enquiry_activity();

create or replace function public.tg_log_service_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity('service_updated', 'service', coalesce(new.id, old.id), jsonb_build_object('title', coalesce(new.title, old.title)));
  return coalesce(new, old);
end;
$$;

create trigger services_activity
after insert or update or delete on public.services
for each row execute function public.tg_log_service_activity();

-- ---------------------------------------------------------------------------
-- Role protection: ADMIN cannot change OWNER privileges; users cannot self-promote
-- ---------------------------------------------------------------------------

create or replace function public.protect_profile_roles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role public.user_role;
begin
  actor_role := public.current_profile_role();

  if tg_op = 'UPDATE' then
    if new.role is distinct from old.role or new.status is distinct from old.status then
      if actor_role is null then
        -- service role / trigger path
        return new;
      end if;

      if old.role = 'OWNER' and not public.is_owner() then
        raise exception 'Only an OWNER can modify an OWNER profile';
      end if;

      if new.role = 'OWNER' and not public.is_owner() then
        raise exception 'Only an OWNER can grant OWNER role';
      end if;

      if actor_role = 'ADMIN' and new.role = 'ADMIN' and old.role = 'EMPLOYEE' then
        -- ADMIN may promote employees to ADMIN only if we allow it; keep conservative:
        -- ADMIN may manage EMPLOYEE status, not promote to ADMIN/OWNER
        null;
      end if;

      if actor_role = 'ADMIN' and (new.role in ('OWNER', 'ADMIN') and old.role is distinct from new.role) then
        raise exception 'ADMIN cannot assign ADMIN or OWNER roles';
      end if;

      if actor_role = 'EMPLOYEE' then
        raise exception 'Employees cannot change roles';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_protect_roles
before update on public.profiles
for each row execute function public.protect_profile_roles();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.media enable row level security;
alter table public.services enable row level security;
alter table public.enquiries enable row level security;
alter table public.studio_settings enable row level security;
alter table public.activity enable row level security;

-- Profiles
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin_or_owner());

create policy "Users can update own limited profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
  );

create policy "Staff can update employee profiles"
  on public.profiles for update
  using (public.is_admin_or_owner())
  with check (public.is_admin_or_owner());

create policy "Owner can insert profiles"
  on public.profiles for insert
  with check (public.is_owner() or public.is_admin_or_owner());

-- Projects
create policy "Public can read published projects"
  on public.projects for select
  using (
    published = true
    or public.is_admin_or_owner()
    or public.is_assigned_to_project(id)
  );

create policy "Staff can insert projects"
  on public.projects for insert
  with check (public.is_admin_or_owner());

create policy "Staff can update projects"
  on public.projects for update
  using (public.is_admin_or_owner())
  with check (public.is_admin_or_owner());

create policy "Staff can delete projects"
  on public.projects for delete
  using (public.is_admin_or_owner());

-- Project members
create policy "Staff and members can read assignments"
  on public.project_members for select
  using (
    public.is_admin_or_owner()
    or user_id = auth.uid()
  );

create policy "Staff can assign members"
  on public.project_members for insert
  with check (public.is_admin_or_owner());

create policy "Staff can remove members"
  on public.project_members for delete
  using (public.is_admin_or_owner());

-- Media
create policy "Read published or assigned media"
  on public.media for select
  using (
    public.is_admin_or_owner()
    or public.is_assigned_to_project(project_id)
    or exists (
      select 1 from public.projects p
      where p.id = media.project_id
        and p.published = true
        and media.status = 'READY'
    )
  );

create policy "Upload media to permitted projects"
  on public.media for insert
  with check (
    uploaded_by = auth.uid()
    and (
      public.is_admin_or_owner()
      or public.is_assigned_to_project(project_id)
    )
  );

create policy "Update permitted media"
  on public.media for update
  using (
    public.is_admin_or_owner()
    or (uploaded_by = auth.uid() and public.is_assigned_to_project(project_id))
  )
  with check (
    public.is_admin_or_owner()
    or (uploaded_by = auth.uid() and public.is_assigned_to_project(project_id))
  );

create policy "Delete permitted media"
  on public.media for delete
  using (
    public.is_admin_or_owner()
    or (uploaded_by = auth.uid() and public.is_assigned_to_project(project_id))
  );

-- Services
create policy "Public read published services"
  on public.services for select
  using (published = true or public.is_admin_or_owner());

create policy "Staff manage services insert"
  on public.services for insert
  with check (public.is_admin_or_owner());

create policy "Staff manage services update"
  on public.services for update
  using (public.is_admin_or_owner())
  with check (public.is_admin_or_owner());

create policy "Staff manage services delete"
  on public.services for delete
  using (public.is_admin_or_owner());

-- Enquiries: public insert only; staff read/update; employees have no access
create policy "Anyone can create an enquiry"
  on public.enquiries for insert
  with check (true);

create policy "Staff can read enquiries"
  on public.enquiries for select
  using (public.is_admin_or_owner());

create policy "Staff can update enquiries"
  on public.enquiries for update
  using (public.is_admin_or_owner())
  with check (public.is_admin_or_owner());

create policy "Staff can delete enquiries"
  on public.enquiries for delete
  using (public.is_admin_or_owner());

-- Settings: public read; staff update
create policy "Public can read studio settings"
  on public.studio_settings for select
  using (true);

create policy "Staff can update studio settings"
  on public.studio_settings for update
  using (public.is_admin_or_owner())
  with check (public.is_admin_or_owner());

-- Activity: staff only
create policy "Staff can read activity"
  on public.activity for select
  using (public.is_admin_or_owner());

create policy "Authenticated can insert activity"
  on public.activity for insert
  with check (public.is_active_user() or public.is_admin_or_owner());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  false,
  null,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/x-m4v'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-assets',
  'public-assets',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.storage_project_id(object_name text)
returns uuid
language plpgsql
stable
as $$
declare
  folder text;
begin
  folder := split_part(object_name, '/', 1);
  if folder ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return folder::uuid;
  end if;
  return null;
end;
$$;

create policy "Public read published project files"
  on storage.objects for select
  using (
    bucket_id = 'project-media'
    and (
      public.is_admin_or_owner()
      or (
        public.storage_project_id(name) is not null
        and public.is_assigned_to_project(public.storage_project_id(name))
      )
      or exists (
        select 1 from public.projects p
        where p.id = public.storage_project_id(name)
          and p.published = true
      )
    )
  );

create policy "Permitted users upload project files"
  on storage.objects for insert
  with check (
    bucket_id = 'project-media'
    and public.is_active_user()
    and public.storage_project_id(name) is not null
    and (
      public.is_admin_or_owner()
      or public.is_assigned_to_project(public.storage_project_id(name))
    )
  );

create policy "Permitted users update project files"
  on storage.objects for update
  using (
    bucket_id = 'project-media'
    and (
      public.is_admin_or_owner()
      or public.is_assigned_to_project(public.storage_project_id(name))
    )
  );

create policy "Permitted users delete project files"
  on storage.objects for delete
  using (
    bucket_id = 'project-media'
    and (
      public.is_admin_or_owner()
      or public.is_assigned_to_project(public.storage_project_id(name))
    )
  );

create policy "Public assets are readable"
  on storage.objects for select
  using (bucket_id = 'public-assets');

create policy "Staff upload public assets"
  on storage.objects for insert
  with check (bucket_id = 'public-assets' and public.is_admin_or_owner());

create policy "Staff update public assets"
  on storage.objects for update
  using (bucket_id = 'public-assets' and public.is_admin_or_owner());

create policy "Staff delete public assets"
  on storage.objects for delete
  using (bucket_id = 'public-assets' and public.is_admin_or_owner());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select on public.projects, public.services, public.studio_settings, public.media to anon;
grant insert on public.enquiries to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Seed: studio identity only. No invented awards, clients, or statistics.
-- ---------------------------------------------------------------------------

insert into public.studio_settings (
  id,
  studio_name,
  contact_email,
  phone,
  address,
  locations,
  tagline,
  hero_headline,
  hero_subheadline,
  about_intro,
  about_story,
  seo_title,
  seo_description
) values (
  1,
  'Uma Events',
  '',
  '',
  'Vijayawada, Andhra Pradesh',
  array['Vijayawada'],
  'Celebrations, crafted beautifully.',
  'We create moments worth remembering.',
  'Event management and planning from Vijayawada — weddings, celebrations, and gatherings shaped with care.',
  'Uma Events is an event management and event planning studio based in Vijayawada, Andhra Pradesh.',
  'Uma Events plans and produces gatherings in Vijayawada and beyond. From weddings and receptions to corporate programmes and private celebrations, the studio focuses on atmosphere, detail, and a calm, considered process. This story is editable from the studio settings so it always reflects the team as it is — not as a template imagines it.',
  'Uma Events | Event management in Vijayawada',
  'Uma Events is an event management and planning studio in Vijayawada, Andhra Pradesh. Explore services, selected events, and enquire about your celebration.'
)
on conflict (id) do nothing;

-- Starter services are unpublished. Publish from the admin CMS when they are actually offered.
insert into public.services (title, short_description, category, display_order, published)
select * from (
  values
    ('Wedding Events', 'Full wedding planning and production — ceremony, procession, and the atmosphere around them.', 'Weddings', 10, false),
    ('Engagements', 'Intimate and large-format engagement gatherings, styled with intention.', 'Weddings', 20, false),
    ('Reception Events', 'Reception design, guest flow, and evening production.', 'Weddings', 30, false),
    ('Birthday Celebrations', 'Personal celebrations with considered décor and hosting.', 'Celebrations', 40, false),
    ('Corporate Events', 'Conferences, launches, and hosted programmes for organisations.', 'Corporate', 50, false),
    ('Theme Events', 'Concept-led evenings built around a clear visual and narrative idea.', 'Celebrations', 60, false),
    ('Stage & Venue Decoration', 'Stage, floral, lighting, and spatial design for venues.', 'Production', 70, false),
    ('Entertainment & Live Performances', 'Live music, dance, and performance programming.', 'Production', 80, false),
    ('Celebrity / Artist Management', 'Artist coordination and appearance management for events.', 'Production', 90, false),
    ('Brand Promotions', 'Brand activations and promotional experiences.', 'Brand', 100, false),
    ('Road Shows', 'Multi-stop promotional programmes and touring activations.', 'Brand', 110, false),
    ('Exhibitions', 'Exhibition layout, visitor flow, and on-site production.', 'Corporate', 120, false),
    ('Special Celebrations', 'Milestones and private gatherings that do not fit a standard category.', 'Celebrations', 130, false)
) as s(title, short_description, category, display_order, published)
where not exists (select 1 from public.services);
