import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutSlideshow } from "@/components/ui/AboutSlideshow";
import { ArrowRight, BookOpen, Users, Award, ChevronRight } from "lucide-react";
import { getPublishedCourses, getPublishedCourseCount } from "@/lib/courses";
import { BRAND_NAME } from "@/lib/brand";

export default async function LandingPage() {
  const [allCourses, programCount] = await Promise.all([
    getPublishedCourses(),
    getPublishedCourseCount(),
  ]);

  const featuredCourses = allCourses.slice(0, 6);

  // DB-backed metrics (avoid incorrect hardcoded values)
  const studentCountDisplay = '—';
  const freeForRescueesDisplay = '—';


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="relative bg-[var(--color-accent)] overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--color-primary),_transparent_40%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block py-1 px-3 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-semibold mb-6">
                A Perur Rays of Hope Initiative
              </span>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-[var(--color-text-dark)] mb-6 leading-tight">
                Empowering Women Through{' '}
                <span className="text-[var(--color-primary)]">Vocational Training</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                HER Lab University offers high-quality, practical courses to equip young rural women with the technical skills they need for a dignified, fulfilling future.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-primary)] hover:bg-[#cf5626] transition-colors"
                >
                  Explore Courses <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-3.5 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Student Login
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-secondary)] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center p-4">
                <div className="p-3 bg-white/10 rounded-full mb-4">
                  <Users className="h-8 w-8 text-[var(--color-accent)]" />
                </div>
                <div className="text-4xl font-display font-bold text-white mb-2">
                  {studentCountDisplay}
                </div>

                <div className="text-[var(--color-accent)]/80 text-sm font-medium uppercase tracking-wide">
                  Students Empowered
                </div>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="p-3 bg-white/10 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-[var(--color-accent)]" />
                </div>
                <div className="text-4xl font-display font-bold text-white mb-2">
                  {programCount}
                </div>
                <div className="text-[var(--color-accent)]/80 text-sm font-medium uppercase tracking-wide">
                  Vocational Programs
                </div>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="p-3 bg-white/10 rounded-full mb-4">
                  <Award className="h-8 w-8 text-[var(--color-accent)]" />
                </div>
                <div className="text-4xl font-display font-bold text-white mb-2">
                  {freeForRescueesDisplay}
                </div>

                <div className="text-[var(--color-accent)]/80 text-sm font-medium uppercase tracking-wide">
                  Free for Rescuees
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-display font-bold text-[var(--color-text-dark)]">
                  Featured Programs
                </h2>
                <p className="mt-2 text-gray-600">
                  Discover our practical, hands-on training courses.
                </p>
              </div>
              <Link
                href="/courses"
                className="hidden sm:flex items-center text-[var(--color-primary)] font-medium hover:underline"
              >
                View all programs <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {featuredCourses.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500">Published programs will appear here soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all"
                  >
                    <div
                      className={`h-40 flex items-center justify-center text-6xl ${course.color} transition-transform group-hover:scale-105 duration-300`}
                    >
                      {course.icon}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {course.category}
                        </span>
                        <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {course.duration}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-10 text-center sm:hidden">
              <Link
                href="/courses"
                className="inline-flex items-center text-[var(--color-primary)] font-medium border border-[var(--color-primary)] px-6 py-2 rounded-md"
              >
                View all programs
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-white to-gray-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-10 lg:mb-0 rounded-2xl overflow-hidden shadow-md ring-1 ring-gray-100">
                <AboutSlideshow />
              </div>
              <div className="border-l-4 border-[var(--color-primary)] pl-8 py-2">
                <h2 className="text-3xl font-display font-bold text-[var(--color-text-dark)] mb-6 leading-snug">
                  Our Mission in HER Lab West Pokot
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Located in West Pokot County, Kenya, Perur Rays of Hope is dedicated to Breaking the cycles of FGM and early marriage through economic empowerment. We equip young rural women, refugees, and persons with disabilities with technical skills for a dignified, fulfilling future.
                </p>
                <p className="mt-6 text-sm font-medium text-[var(--color-secondary)]">
                  {BRAND_NAME} is our digital learning portal for enrolled students.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

