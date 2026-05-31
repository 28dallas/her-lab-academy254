import Link from 'next/link';
import { BookOpen, Users, FileText, MessageSquare, Bell, Star, Settings, ClipboardList } from 'lucide-react';

const sections = [
  { label: 'Course Outline', desc: 'Build and reorder modules', href: 'outline', icon: BookOpen },
  { label: 'Resources', desc: 'Upload PDFs, videos, docs', href: 'resources', icon: FileText },
  { label: 'Quizzes', desc: 'Create assessments', href: 'quizzes', icon: ClipboardList },
  { label: 'Students', desc: 'View enrollment & progress', href: 'students', icon: Users },
  { label: 'Forum', desc: 'Moderate discussions', href: 'forum', icon: MessageSquare },
  { label: 'Announcements', desc: 'Post course announcements', href: 'announcements', icon: Bell },
  { label: 'Evaluations', desc: 'View student ratings', href: 'evaluations', icon: Star },
  { label: 'Settings', desc: 'Edit course info & code', href: 'settings', icon: Settings },
];

export default function TeacherCourseHub({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)]">Course Management</h1>
        <p className="text-gray-600 mt-1">Manage all aspects of your course.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(s => (
          <Link
            key={s.href}
            href={`/teacher/course/${params.id}/${s.href}`}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[var(--color-primary)] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)]/10 transition-colors">
              <s.icon className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{s.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
