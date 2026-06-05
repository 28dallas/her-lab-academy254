-- Student ID used for login (must exist before handle_new_user references it)
alter table profiles
  add column if not exists student_code text unique;

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, student_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student',
    nullif(trim(new.raw_user_meta_data->>'student_code'), '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case
      when excluded.full_name is not null and excluded.full_name <> '' then excluded.full_name
      else profiles.full_name
    end,
    student_code = coalesce(nullif(trim(excluded.student_code), ''), profiles.student_code);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Quizzes
create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  module_id uuid references course_modules(id) on delete cascade,
  title text not null,
  description text,
  passing_score int default 70 check (passing_score between 0 and 100),
  order_index int default 0,
  created_at timestamptz default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  question text not null,
  options jsonb not null default '[]',
  correct_index int not null default 0,
  order_index int default 0,
  created_at timestamptz default now()
);

create table if not exists quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  score int not null check (score between 0 and 100),
  passed boolean not null default false,
  answers jsonb,
  submitted_at timestamptz default now(),
  unique (quiz_id, student_id)
);

create index if not exists idx_quizzes_course_id on quizzes(course_id);
create index if not exists idx_quiz_questions_quiz_id on quiz_questions(quiz_id);
create index if not exists idx_quiz_submissions_student on quiz_submissions(student_id);

alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_submissions enable row level security;

create policy "Enrolled students read quizzes"
on quizzes for select
using (public.is_enrolled_in(course_id) or public.is_course_teacher(course_id) or public.is_admin());

create policy "Teachers manage quizzes"
on quizzes for all
using (public.is_course_teacher(course_id) or public.is_admin())
with check (public.is_course_teacher(course_id) or public.is_admin());

create policy "Read quiz questions when can read quiz"
on quiz_questions for select
using (
  exists (
    select 1 from quizzes q
    where q.id = quiz_questions.quiz_id
    and (
      public.is_enrolled_in(q.course_id)
      or public.is_course_teacher(q.course_id)
      or public.is_admin()
    )
  )
);

create policy "Teachers manage quiz questions"
on quiz_questions for all
using (
  exists (
    select 1 from quizzes q
    where q.id = quiz_questions.quiz_id
    and (public.is_course_teacher(q.course_id) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from quizzes q
    where q.id = quiz_questions.quiz_id
    and (public.is_course_teacher(q.course_id) or public.is_admin())
  )
);

create policy "Students read own submissions"
on quiz_submissions for select
using (student_id = auth.uid() or public.is_admin());

create policy "Teachers read course quiz submissions"
on quiz_submissions for select
using (
  exists (
    select 1 from quizzes q
    where q.id = quiz_submissions.quiz_id
    and public.is_course_teacher(q.course_id)
  )
);

create policy "Students submit own quizzes"
on quiz_submissions for insert
with check (
  student_id = auth.uid()
  and exists (
    select 1 from quizzes q
    where q.id = quiz_submissions.quiz_id
    and public.is_enrolled_in(q.course_id)
  )
);
