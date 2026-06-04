-- Add a student login ID to profile records
alter table profiles
  add column if not exists student_code text unique;

-- Keep profile entries synchronized when auth users are created via Supabase auth trigger
-- (handled by an updated trigger function in the migrations directory)
