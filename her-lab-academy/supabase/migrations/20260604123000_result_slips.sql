create table if not exists result_slips (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  uploaded_by uuid references profiles(id),
  title text not null,
  file_url text not null,
  file_size text,
  remarks text,
  issued_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists idx_result_slips_student_id on result_slips(student_id);
create index if not exists idx_result_slips_course_id on result_slips(course_id);

alter table result_slips enable row level security;

create policy "Students read own result slips"
on result_slips for select
using (student_id = auth.uid());

create policy "Teachers read course result slips"
on result_slips for select
using (public.is_course_teacher(course_id) or public.is_admin());

create policy "Teachers insert course result slips"
on result_slips for insert
with check (
  (public.is_course_teacher(course_id) or public.is_admin())
  and exists (
    select 1
    from enrollments e
    where e.student_id = result_slips.student_id
    and e.course_id = result_slips.course_id
  )
);

create policy "Teachers update course result slips"
on result_slips for update
using (public.is_course_teacher(course_id) or public.is_admin())
with check (public.is_course_teacher(course_id) or public.is_admin());

create policy "Teachers delete course result slips"
on result_slips for delete
using (public.is_course_teacher(course_id) or public.is_admin());
