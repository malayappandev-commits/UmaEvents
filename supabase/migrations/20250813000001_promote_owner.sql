-- Run in the Supabase SQL editor after creating the first Auth user.
-- New users always start as EMPLOYEE (never trust client-supplied roles).

create or replace function public.promote_email_to_owner(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = 'OWNER', status = 'ACTIVE'
  where lower(email) = lower(p_email);

  if not found then
    raise exception 'No profile found for %', p_email;
  end if;
end;
$$;

revoke all on function public.promote_email_to_owner(text) from public, anon, authenticated;
grant execute on function public.promote_email_to_owner(text) to postgres, service_role;
