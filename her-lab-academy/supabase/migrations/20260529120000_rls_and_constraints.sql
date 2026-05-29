-- Unique enrollment per student per course
alter table enrollments
  add constraint enrollments_student_course_unique unique (student_id, course_id);

alter table student_progress
  add constraint student_progress_student_resource_unique unique (student_id, resource_id);

-- Helper: current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: current user is teacher of a course
create or replace function public.is_course_teacher(course_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from courses
    where id = course_uuid and teacher_id = auth.uid()
  );
$$;

-- Helper: student enrolled in course
create or replace function public.is_enrolled_in(course_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from enrollments
    where course_id = course_uuid and student_id = auth.uid()
  );
$$;

-- profiles
alter table profiles enable row level security;

create policy "Users read own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users update own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users insert own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Admins manage all profiles"
on profiles for all
using (public.is_admin())
with check (public.is_admin());

create policy "Teachers read profiles in their courses"
on profiles for select
using (
  exists (
    select 1 from enrollments e
    join courses c on c.id = e.course_id
    where e.student_id = profiles.id
    and c.teacher_id = auth.uid()
  )
);

-- courses
alter table courses enable row level security;

create policy "Anyone reads published courses"
on courses for select
using (
  is_published = true
  or teacher_id = auth.uid()
  or public.is_enrolled_in(id)
  or public.is_admin()
);

create policy "Teachers update own courses"
on courses for update
using (teacher_id = auth.uid())
with check (teacher_id = auth.uid());

create policy "Admins manage courses"
on courses for all
using (public.is_admin())
with check (public.is_admin());

-- course_modules
alter table course_modules enable row level security;

create policy "Enrolled students read modules"
on course_modules for select
using (
  public.is_enrolled_in(course_id)
  or public.is_course_teacher(course_id)
  or public.is_admin()
);

create policy "Teachers manage own course modules"
on course_modules for all
using (public.is_course_teacher(course_id))
with check (public.is_course_teacher(course_id));

create policy "Admins manage all modules"
on course_modules for all
using (public.is_admin())
with check (public.is_admin());

-- resources: add student read (teacher policy exists)
create policy "Enrolled students read resources"
on resources for select
using (
  exists (
    select 1 from course_modules m
    where m.id = resources.module_id
    and (
      public.is_enrolled_in(m.course_id)
      or public.is_course_teacher(m.course_id)
      or public.is_admin()
    )
  )
);

-- enrollments
alter table enrollments enable row level security;

create policy "Students read own enrollments"
on enrollments for select
using (student_id = auth.uid());

create policy "Students insert own enrollment"
on enrollments for insert
with check (student_id = auth.uid());

create policy "Teachers read course enrollments"
on enrollments for select
using (public.is_course_teacher(course_id));

create policy "Teachers update course enrollments"
on enrollments for update
using (public.is_course_teacher(course_id));

create policy "Admins manage enrollments"
on enrollments for all
using (public.is_admin())
with check (public.is_admin());

-- forum_posts
alter table forum_posts enable row level security;

create policy "Read forum posts for enrolled or teaching"
on forum_posts for select
using (
  course_id is null
  or public.is_enrolled_in(course_id)
  or public.is_course_teacher(course_id)
  or public.is_admin()
);

create policy "Insert forum posts as author"
on forum_posts for insert
with check (
  author_id = auth.uid()
  and (
    (course_id is null and public.is_admin())
    or (course_id is not null and public.is_enrolled_in(course_id))
    or (course_id is not null and public.is_course_teacher(course_id))
    or (course_id is not null and public.is_admin())
  )
);

create policy "Teachers update forum in own courses"
on forum_posts for update
using (public.is_course_teacher(course_id));

create policy "Admins manage forum posts"
on forum_posts for all
using (public.is_admin())
with check (public.is_admin());

-- certificates
alter table certificates enable row level security;

create policy "Students read own certificates"
on certificates for select
using (student_id = auth.uid());

create policy "Admins manage certificates"
on certificates for all
using (public.is_admin())
with check (public.is_admin());

-- complaint_replies
alter table complaint_replies enable row level security;

create policy "Students read replies on own complaints"
on complaint_replies for select
using (
  exists (
    select 1 from complaints c
    where c.id = complaint_replies.complaint_id
    and c.student_id = auth.uid()
  )
);

create policy "Admins manage complaint replies"
on complaint_replies for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins read all complaints"
on complaints for select
using (public.is_admin());

create policy "Admins update complaints"
on complaints for update
using (public.is_admin());

-- evaluations: add select policies
create policy "Students read own evaluations"
on evaluations for select
using (student_id = auth.uid());

create policy "Teachers read evaluations for their courses"
on evaluations for select
using (teacher_id = auth.uid());

-- surveys
alter table surveys enable row level security;

create policy "Students manage own surveys"
on surveys for all
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "Teachers read course surveys"
on surveys for select
using (public.is_course_teacher(course_id));

create policy "Admins manage surveys"
on surveys for all
using (public.is_admin())
with check (public.is_admin());
