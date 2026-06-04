import { getPublishedCourses } from '@/lib/courses';
import RegisterFormClient from './RegisterFormClient';

export default async function RegisterPage() {
  const courses = await getPublishedCourses();

  return <RegisterFormClient courses={courses.map((course) => ({ id: course.id, title: course.title }))} />;
}
