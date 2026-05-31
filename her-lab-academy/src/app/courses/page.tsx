import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import CoursesCatalogClient from '@/components/courses/CoursesCatalogClient';
import { getPublishedCourses } from '@/lib/courses';

export const metadata: Metadata = {
  title: 'Our Programs | HER Lab University',
  description:
    'Browse vocational and technical training programs for women and girls at HER Lab University, West Pokot, Kenya.',
  openGraph: {
    title: 'Our Programs | HER Lab University',
    description: 'Practical, job-ready vocational courses — free for rescuees.',
  },
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-[var(--color-text-dark)] mb-4">
            Our Programs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse our vocational and technical training courses designed to equip you with
            practical, job-ready skills.
          </p>
        </div>

        <CoursesCatalogClient courses={courses} />
      </main>

      <Footer />
    </div>
  );
}
