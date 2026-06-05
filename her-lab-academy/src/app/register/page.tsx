import { Suspense } from 'react';
import { getPublishedCourses } from '@/lib/courses';
import RegisterFormClient from './RegisterFormClient';

export default async function RegisterPage() {
  const courses = await getPublishedCourses();
  const courseOptions = courses.map((course) => ({ id: course.id, title: course.title }));

  return (
    <Suspense>
      <RegisterFormClient courses={courseOptions} />
    </Suspense>
  );
}
