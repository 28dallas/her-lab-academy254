-- Unique certificate per student per course
alter table certificates
  add constraint certificates_student_course_unique unique (student_id, course_id);

-- Certificates storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificates', 'certificates', true, 5242880, array['application/pdf'])
on conflict (id) do update set public = true;

create policy "Public read certificate PDFs"
on storage.objects for select
using (bucket_id = 'certificates');

create policy "Authenticated users upload certificate PDFs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users update own certificate PDFs"
on storage.objects for update
to authenticated
using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Students can insert own certificate records
create policy "Students insert own certificates"
on certificates for insert
with check (auth.uid() = student_id);
