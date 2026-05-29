'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { submitEvaluation } from '@/app/actions/student';

export default function EvaluationPage({ params }: { params: { courseId: string } }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('completed, progress_percent')
        .eq('student_id', user.id)
        .eq('course_id', params.courseId)
        .maybeSingle();

      const { data: existing } = await supabase
        .from('evaluations')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', params.courseId)
        .maybeSingle();

      if (existing) setSubmitted(true);

      setIsUnlocked(
        !!enrollment &&
          (enrollment.completed || (enrollment.progress_percent ?? 0) >= 100)
      );
      setLoading(false);
    })();
  }, [params.courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setError('');

    const formData = new FormData();
    formData.set('courseId', params.courseId);
    formData.set('rating', String(rating));
    formData.set('feedback', feedback);

    const result = await submitEvaluation(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center text-gray-500">Loading...</div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Evaluation Locked</h2>
        <p className="text-gray-600">
          Complete 100% of the course to unlock the lecturer evaluation.
        </p>
        <Link
          href={`/dashboard/course/${params.courseId}`}
          className="mt-6 inline-flex items-center gap-2 text-[var(--color-primary)] font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
          Thank you for your feedback!
        </h2>
        <p className="text-gray-600">
          Your evaluation has been submitted and will help improve the course.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 text-[var(--color-primary)] font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-12">
      <Link
        href={`/dashboard/course/${params.courseId}`}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-dark)] mb-2">
          Evaluate Your Lecturer
        </h1>
        <p className="text-gray-600 mb-8">
          Your honest feedback helps us improve the quality of teaching.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Overall Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className="w-10 h-10"
                    fill={(hovered || rating) >= star ? '#E8612C' : 'none'}
                    stroke={(hovered || rating) >= star ? '#E8612C' : '#D1D5DB'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Written Feedback{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-y"
              placeholder="What did you like? What could be improved?"
            />
          </div>

          <button
            type="submit"
            disabled={rating === 0}
            className="w-full py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[#cf5626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Evaluation
          </button>
        </form>
      </div>
    </div>
  );
}
