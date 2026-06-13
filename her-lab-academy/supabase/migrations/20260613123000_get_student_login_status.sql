-- Create function to securely retrieve student login status bypassing RLS
create or replace function public.get_student_login_status(identifier text)
returns table (
  profile_id uuid,
  profile_email text,
  profile_role text,
  profile_student_code text,
  has_signed_in boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := trim(identifier);
  found_id uuid;
  found_email text;
  found_role text;
  found_student_code text;
  last_login timestamptz;
begin
  if normalized = '' then
    return;
  end if;

  if position('@' in normalized) > 0 then
    select p.id, p.email, p.role, p.student_code
    into found_id, found_email, found_role, found_student_code
    from public.profiles p
    where lower(p.email) = lower(normalized)
    limit 1;
  else
    select p.id, p.email, p.role, p.student_code
    into found_id, found_email, found_role, found_student_code
    from public.profiles p
    where p.student_code = normalized or lower(p.student_code) = lower(normalized)
    limit 1;
  end if;

  if found_id is not null then
    select u.last_sign_in_at
    into last_login
    from auth.users u
    where u.id = found_id;

    profile_id := found_id;
    profile_email := found_email;
    profile_role := found_role;
    profile_student_code := found_student_code;
    has_signed_in := (last_login is not null);
    return next;
  end if;
end;
$$;

revoke all on function public.get_student_login_status(text) from public;
grant execute on function public.get_student_login_status(text) to anon, authenticated, service_role;
