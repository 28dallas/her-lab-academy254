'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { submitQuiz } from '@/app/actions/student';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function StudentQuizPage({
  params,
}: {
  params: { id: string; quizId: string };
}) {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', params.quizId)
        .single();
      setTitle(quiz?.title ?? 'Quiz');

      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('question, options')
        .eq('quiz_id', params.quizId)
        .order('order_index')
        .limit(1);

      if (questions?.[0]) {
        setQuestion(questions[0].question);
        setOptions((questions[0].options as string[]) ?? []);
      }
      setLoading(false);
    })();
  }, [params.quizId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === null) return;
    const fd = new FormData();
    fd.set('quizId', params.quizId);
    fd.set('selectedIndex', String(selected));
    const res = await submitQuiz(fd);
    if (res.success) setResult({ score: res.score!, passed: res.passed! });
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading quiz...</div>;

  if (result) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        {result.passed ? (
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        )}
        <h2 className="text-2xl font-bold">{result.passed ? 'Passed!' : 'Try again'}</h2>
        <p className="text-gray-600 mt-2">Score: {result.score}%</p>
        <Link href={`/dashboard/course/${params.id}`} className="mt-6 inline-block text-[var(--color-primary)]">
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-12">
      <Link href={`/dashboard/course/${params.id}`} className="text-sm text-gray-500">
        ← Back to course
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">{title}</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
        <p className="font-medium text-gray-900">{question}</p>
        {options.map((opt, i) => (
          <label key={i} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="answer"
              checked={selected === i}
              onChange={() => setSelected(i)}
            />
            <span>{opt}</span>
          </label>
        ))}
        <button
          type="submit"
          disabled={selected === null}
          className="w-full py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium disabled:opacity-50"
        >
          Submit Quiz
        </button>
      </form>
    </div>
  );
}
