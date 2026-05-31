import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Clock, BookOpen, ChevronDown, CheckCircle2 } from 'lucide-react';
import { getPublishedCourseById } from '@/lib/courses';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const course = await getPublishedCourseById(params.id);
  if (!course) return { title: 'Course Not Found | Her Lab Academy' };
  const description =
    course.description?.slice(0, 155) ??
    `${course.title} — vocational training at Her Lab Academy, West Pokot, Kenya.`;
  return {
    title: `${course.title} | Her Lab Academy`,
    description,
    openGraph: {
      title: course.title,
      description,
      type: 'website',
    },
  };
}

export default async function PublicCoursePage({ params }: { params: { id: string } }) {
  const course = await getPublishedCourseById(params.id);

  if (!course) notFound();

  const features = [
    'Practical, hands-on training',
    'Taught by experienced instructors',
    'Certificate of completion',
    'Access to Her Lab Academy network',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        <div className="bg-gray-50 border-b border-gray-200 pt-16 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-md mb-4">
                  {course.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--color-text-dark)] mb-6">
                  {course.title}
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-3xl leading-relaxed">
                  {course.description ??
                    'A practical vocational program at Her Lab Academy, designed to build job-ready skills.'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{course.duration}</span>
                </div>
              </div>

              <div className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div
                  className={`h-48 flex items-center justify-center text-7xl relative overflow-hidden ${course.color}`}
                >
                  {course.coverImageUrl ? (
                    <img
                      src={course.coverImageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    course.icon
                  )}
                </div>
                <div className="p-6">
                  <div className="text-2xl font-bold text-[var(--color-text-dark)] mb-4">Free</div>
                  <Link
                    href="/register"
                    className="block w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-[#cf5626] text-white text-center font-medium rounded-lg transition-colors mb-4"
                  >
                    Enroll Now
                  </Link>
                  <p className="text-xs text-center text-gray-500 mb-6">
                    Requires an enrollment code from your administrator.
                  </p>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      This course includes:
                    </h4>
                    <ul className="space-y-2">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-[var(--color-text-dark)] mb-8">
              Course Syllabus
            </h2>
            {course.modules.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-12 text-center">
                <p className="text-gray-500">Syllabus coming soon.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {course.modules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                  >
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <h3 className="font-semibold text-gray-900">{mod.title}</h3>
                      </div>
                      <span className="text-sm text-gray-500 hidden sm:flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> {mod.resourceCount} resources
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-400 sm:hidden" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 p-6 bg-orange-50 rounded-xl border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Ready to start learning?</h4>
                <p className="text-sm text-gray-600">
                  Get your enrollment code from your local admin and register today.
                </p>
              </div>
              <Link
                href="/register"
                className="whitespace-nowrap px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
