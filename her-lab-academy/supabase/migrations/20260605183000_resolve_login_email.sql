-- Allow resolving auth email from student ID or email before sign-in (RLS blocks direct profile reads).
create or replace function public.resolve_login_email(identifier text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := trim(identifier);
  found_email text;
begin
  if normalized = '' then
    return null;
  end if;

  if position('@' in normalized) > 0 then
    select p.email
    into found_email
    from public.profiles p
    where lower(p.email) = lower(normalized)
    limit 1;

    return coalesce(found_email, lower(normalized));
  end if;

  select p.email
  into found_email
  from public.profiles p
  where p.student_code = normalized
  limit 1;

  return found_email;
end;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated, service_role;
