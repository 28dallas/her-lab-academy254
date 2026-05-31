'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { createQuiz } from '@/app/actions/teacher';

export default function TeacherQuizzesPage({ params }: { params: { id: string } }) {
  const [quizzes, setQuizzes] = useState<{ id: string; title: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('Option A|Option B|Option C|Option D');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('quizzes')
      .select('id, title')
      .eq('course_id', params.id)
      .order('created_at', { ascending: false });
    setQuizzes(data ?? []);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('title', title);
    fd.set('question', question);
    fd.set('options', options);
    fd.set('correctIndex', String(correctIndex));
    const result = await createQuiz(params.id, fd);
    if (result.error) {
      setError(result.error);
      return;
    }
    setTitle('');
    setQuestion('');
    setShowForm(false);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link href={`/teacher/course/${params.id}`} className="text-sm text-gray-500 hover:text-[var(--color-primary)]">
        ← Back to Course
      </Link>
      <div className="flex justify-between items-center mt-4 mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-[var(--color-primary)]" /> Quizzes
        </h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" /> New Quiz
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-6 mb-6 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="Options separated by |"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <label className="text-sm text-gray-600">
            Correct option index (0 = first):
            <input
              type="number"
              min={0}
              max={3}
              value={correctIndex}
              onChange={(e) => setCorrectIndex(Number(e.target.value))}
              className="ml-2 border rounded px-2 py-1 w-16"
            />
          </label>
          <button type="submit" className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm">
            Create Quiz
          </button>
        </form>
      )}

      {quizzes.length === 0 ? (
        <p className="text-gray-500 text-center py-12 border border-dashed rounded-xl">No quizzes yet.</p>
      ) : (
        <ul className="space-y-2">
          {quizzes.map((q) => (
            <li key={q.id} className="bg-white border rounded-lg px-4 py-3 flex justify-between">
              <span className="font-medium">{q.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
