# Uma Events

Premium public website, owner/admin studio, and employee media workspace for Uma Events — an event management studio in Vijayawada, Andhra Pradesh.

## Stack

Next.js App Router · TypeScript · Tailwind CSS · Framer Motion · TanStack Query · Zod · Supabase (Auth, PostgreSQL, Storage, RLS)

There is no separate database or auth system. Media binaries live in Supabase Storage; PostgreSQL stores metadata only. Large files upload with TUS resumable uploads — they do not pass through Next.js API routes.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose to the browser)
   - `NEXT_PUBLIC_SITE_URL`
   - Optional SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO`) so contact enquiries can also send email. Enquiries are always stored in the database.

3. Apply migrations from `supabase/migrations/` in the Supabase SQL editor (in filename order) or with the Supabase CLI:

   ```bash
   supabase db push
   ```

4. In Authentication, create the first user (the owner). Then in the SQL editor:

   ```sql
   select public.promote_email_to_owner('owner@example.com');
   ```

5. Install and run:

   ```bash
   npm install
   npm run dev
   ```

## Routes

| Audience | Paths |
| --- | --- |
| Public | `/` `/services` `/services/[slug]` `/gallery` `/about` `/contact` `/portfolio/[slug]` (event detail) |
| Auth | `/login` |
| Admin / Owner | `/admin` (portal, profile, notifications, employee management, enquiries, featured events, testimonials, services gallery, service ratings, main gallery, milestones, services) |
| Employees | `/employee` `/employee/projects` `/employee/projects/[id]` |

Permissions are enforced with Postgres Row Level Security and Storage policies, not only UI checks.

## Notes

- Services are CMS-managed. Seeded services start **unpublished** so the public site does not claim offerings until the studio publishes them.
- Client names on events stay private unless `show_client_publicly` is enabled.
- Do not invent awards, years, or client statistics — those belong in Settings / project fields.
- Admin and employee portals are `noindex`.
