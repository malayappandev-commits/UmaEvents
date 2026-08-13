-- Manual RLS checklist (run against a local or staging project with three test users).
-- Expected: public can read published content and insert enquiries;
-- employees cannot read enquiries/settings write/other projects;
-- admin cannot promote themselves to OWNER.

-- 1. As anon:
-- select * from projects where published = true;          -- allowed
-- insert into enquiries (name, email, phone, message)     -- allowed
--   values ('Test', 'a@b.c', '000', 'Hello there!!');
-- select * from enquiries;                                -- denied
-- update studio_settings set tagline = 'x' where id = 1;  -- denied

-- 2. As employee assigned only to project A:
-- select * from projects where id = 'B';                  -- denied unless published
-- insert into media (...) with project_id = 'B';          -- denied
-- select * from enquiries;                                -- denied

-- 3. As admin:
-- update profiles set role = 'OWNER' where id = admin;    -- denied by trigger
