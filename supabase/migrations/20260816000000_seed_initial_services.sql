-- Seed the initial Uma Events service catalogue as real, published CMS
-- records (not hardcoded UI). Consumed entirely through the existing
-- getPublishedServices() / getPublishedServiceBySlug() queries and editable
-- afterwards through Admin → Services — nothing here is frontend-only.
--
-- Existing legacy seed rows from 20250813000000_init.sql for "Wedding
-- Events", "Birthday Celebrations", and "Corporate Events" are renamed in
-- place (title + slug) rather than duplicated, so the catalogue doesn't end
-- up with two wedding-shaped rows. The five services already added by
-- 20260815000000_information_architecture.sql (sangeet, mehendi,
-- baby-shower, housewarming, kitty-party) are filled in and published here.
--
-- image_url values point at /cinematic/imgNN.jpg — placeholder décor
-- photography bundled with the app's public UI reference, not real Uma
-- Events venue photos. Replace each via Admin → Services → Image as soon as
-- real photography is available; nothing else needs to change when you do.

-- ---------------------------------------------------------------------------
-- Rename legacy rows onto the required slugs (only if the target slug is
-- not already taken by a different row, so this migration is safe to re-run).
-- ---------------------------------------------------------------------------

update public.services
set slug = 'birthday-party', title = 'Birthday Party'
where title = 'Birthday Celebrations'
  and slug = 'birthday'
  and not exists (select 1 from public.services x where x.slug = 'birthday-party');

update public.services
set title = 'Wedding'
where slug = 'wedding' and title = 'Wedding Events';

-- 'Corporate Events' already has slug 'corporate-events' from the prior
-- migration and its title already matches — nothing to rename.

-- ---------------------------------------------------------------------------
-- Upsert full content + publish for all 8 required services.
-- ---------------------------------------------------------------------------

insert into public.services
  (title, slug, short_description, long_description, offerings, image_url, category, display_order, published)
values
  (
    'Wedding',
    'wedding',
    'Full wedding planning and mandapam production, built to the scale and tradition of your ceremony.',
    E'The mandapam is where every guest''s eyes stay for hours, so we build it that way — traditional gold and silver framework, or soft natural florals, sized exactly to your venue and set up well before the muhurtham. Beyond the stage, we plan seating, guest flow, and the pathway so the whole ceremony feels considered rather than assembled.',
    array['Traditional gold and silver mandapam styles','Fresh floral mandapams and backdrops','Seating, pathway and pelli peeta arrangements','Entrance and reception coordination'],
    '/cinematic/img06.jpg',
    'Weddings',
    10,
    true
  ),
  (
    'Birthday Party',
    'birthday-party',
    'First birthdays, milestone birthdays, and anniversaries — warm, photo-friendly, and sized to your space.',
    E'Birthdays and milestone celebrations get the same care as a full production, scaled to the room. We plan backdrops, cake tables, and themed corners that photograph well without overwhelming a hall or terrace, and we coordinate timing so the day runs smoothly for hosts and guests.',
    array['Birthday backdrops and cake tables','Themed corners for children''s parties','Anniversary and milestone setups','On-site coordination and hosting support'],
    '/cinematic/img09.jpg',
    'Celebrations',
    40,
    true
  ),
  (
    'Corporate Events',
    'corporate-events',
    'Clean, camera-ready staging for launches, offsites, and annual programmes.',
    E'For launches, offsites and annual events, we build stages that put your branding where the camera sees it, ready well before guests check in. Podiums, seating layout, and lighting are planned around the run of show, not improvised on the day.',
    array['Branded backdrops and stage panels','Podium and seating layout','Product launch and inauguration setups','On-site production coordination'],
    '/cinematic/img07.jpg',
    'Corporate',
    50,
    true
  ),
  (
    'Kitty Party',
    'kitty-party',
    'Hosted kitty parties and social gatherings, styled for conversation and comfort.',
    E'Kitty parties and social evenings are planned around how the group actually spends the afternoon — seating that encourages conversation, a styled table, and light décor that suits a home or a hired venue equally well.',
    array['Styled seating and table settings','Themed décor for social gatherings','Light catering coordination on request','Flexible setups for home or venue'],
    '/cinematic/img10.jpg',
    'Celebrations',
    46,
    true
  ),
  (
    'Sangeet',
    'sangeet',
    'Sangeet evenings planned around music, sequence, and guest energy.',
    E'A sangeet lives or dies on pacing — we plan the run of show, seating, and staging so performances, music, and guest movement flow without dead time, with lighting and décor that hold up for both photos and video.',
    array['Performance staging and lighting','Seating and guest-flow planning','Sound and sequence coordination','Photo and video-friendly décor'],
    '/cinematic/img04.jpg',
    'Weddings',
    22,
    true
  ),
  (
    'Mehendi',
    'mehendi',
    'Mehendi gatherings styled for colour, comfort, and celebration.',
    E'Mehendi functions are usually daytime, colour-forward, and long — we plan seating that stays comfortable for hours, shaded or covered areas where needed, and décor built around the palette you want carried through photos.',
    array['Colour-themed seating and décor','Shaded and covered seating arrangements','Floral and fabric styling','Coordination with the wider wedding décor'],
    '/cinematic/img01.jpg',
    'Weddings',
    24,
    true
  ),
  (
    'Housewarming',
    'housewarming',
    'Housewarming ceremonies and gatherings, held with care around the rituals.',
    E'Gruhapravesam and housewarming functions are handled quietly around the ritual itself — entrance and pooja-area décor, seating for family and guests, and setup that respects the flow of the ceremony rather than working around it.',
    array['Gruhapravesam entrance and pooja area décor','Seating for family and guests','Traditional arrangements on request','Coordination around ceremony timing'],
    '/cinematic/img03.jpg',
    'Celebrations',
    44,
    true
  ),
  (
    'Baby Shower',
    'baby-shower',
    'Baby shower hosting and production, planned to the family''s brief.',
    E'Baby showers and seemantham functions are planned around family tradition and the mother-to-be''s comfort — seating, floral work, and a styled backdrop, handled with the same attention as a larger family function.',
    array['Seemantham seating and floral work','Styled backdrop and photo area','Barasala and cradle ceremony décor on request','Coordination with family traditions'],
    '/cinematic/img05.jpg',
    'Celebrations',
    42,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  offerings = excluded.offerings,
  image_url = coalesce(services.image_url, excluded.image_url),
  category = excluded.category,
  display_order = excluded.display_order,
  published = true;
