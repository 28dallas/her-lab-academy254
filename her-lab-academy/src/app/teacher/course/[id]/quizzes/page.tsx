'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ClipboardList, Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { createQuiz, deleteQuizQuestion, addQuizQuestion } from '@/app/actions/teacher';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  questions?: QuizQuestion[];
  expanded?: boolean;
}

export default function TeacherQuizzesPage({ params }: { params: { id: string } }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  // New question form state per quiz
  const [newQ, setNewQ] = useState<Record<string, { question: string; options: string; correctIndex: number }>>({});

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('quizzes')
      .select('id, title')
      .eq('course_id', params.id)
      .order('created_at', { ascending: false });
    setQuizzes((data ?? []).map((q) => ({ ...q, expanded: false })));
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const loadQuestions = async (quizId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('quiz_questions')
      .select('id, question, options, correct_index, order_index')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId ? { ...q, questions: (data ?? []) as QuizQuestion[], expanded: true } : q
      )
    );
  };

  const toggleExpand = (quizId: string, currentlyExpanded: boolean) => {
    if (!currentlyExpanded) {
      loadQuestions(quizId);
    } else {
      setQuizzes((prev) => prev.map((q) => (q.id === quizId ? { ...q, expanded: false } : q)));
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('title', title);
    fd.set('question', '__placeholder__');
    fd.set('options', 'A|B');
    fd.set('correctIndex', '0');
    const result = await createQuiz(params.id, fd);
    if (result.error) { setError(result.error); return; }
    setTitle('');
    setShowForm(false);
    load();
  };

  const handleAddQuestion = async (quizId: string) => {
    const state = newQ[quizId];
    if (!state?.question?.trim()) return;
    setError('');
    const fd = new FormData();
    fd.set('quizId', quizId);
    fd.set('question', state.question);
    fd.set('options', state.options || 'Option A|Option B|Option C|Option D');
    fd.set('correctIndex', String(state.correctIndex ?? 0));
    const result = await addQuizQuestion(params.id, fd);
    if (result.error) { setError(result.error); return; }
    setNewQ((prev) => ({ ...prev, [quizId]: { question: '', options: 'Option A|Option B|Option C|Option D', correctIndex: 0 } }));
    loadQuestions(quizId);
  };

  const handleDeleteQuestion = async (quizId: string, questionId: string) => {
    if (!confirm('Delete this question?')) return;
    await deleteQuizQuestion(params.id, questionId);
    loadQuestions(quizId);
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

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleCreateQuiz} className="bg-white border rounded-xl p-6 mb-6 space-y-3">
          <p className="text-sm text-gray-500">Create a quiz container — then add questions inside it.</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title (e.g. Module 1 Assessment)"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm">
            Create Quiz
          </button>
        </form>
      )}

      {quizzes.length === 0 ? (
        <p className="text-gray-500 text-center py-12 border border-dashed rounded-xl">No quizzes yet.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleExpand(quiz.id, !!quiz.expanded)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 text-left"
              >
                <span className="font-semibold text-gray-900">{quiz.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{quiz.questions?.length ?? 0} questions</span>
                  {quiz.expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {quiz.expanded && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
                  {/* Existing questions */}
                  {(quiz.questions ?? []).filter(q => q.question !== '__placeholder__').length === 0 ? (
                    <p className="text-sm text-gray-400">No questions yet. Add the first one below.</p>
                  ) : (
                    <ol className="space-y-3">
                      {(quiz.questions ?? []).filter(q => q.question !== '__placeholder__').map((q, idx) => (
                        <li key={q.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start gap-3">
                            <p className="text-sm font-medium text-gray-900">{idx + 1}. {q.question}</p>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(quiz.id, q.id)}
                              className="text-red-400 hover:text-red-600 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <ul className="mt-2 grid grid-cols-2 gap-1">
                            {(q.options as string[]).map((opt, i) => (
                              <li
                                key={i}
                                className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                  i === q.correct_index
                                    ? 'bg-green-100 text-green-800 font-semibold'
                                    : 'bg-white text-gray-600 border'
                                }`}
                              >
                                {i === q.correct_index && <CheckCircle2 className="w-3 h-3" />}
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Add question form */}
                  <div className="bg-[var(--color-accent)]/40 border border-gray-200 rounded-lg p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Question</p>
                    <input
                      value={newQ[quiz.id]?.question ?? ''}
                      onChange={(e) => setNewQ((p) => ({ ...p, [quiz.id]: { ...p[quiz.id], question: e.target.value } }))}
                      placeholder="Question text"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      value={newQ[quiz.id]?.options ?? 'Option A|Option B|Option C|Option D'}
                      onChange={(e) => setNewQ((p) => ({ ...p, [quiz.id]: { ...p[quiz.id], options: e.target.value } }))}
                      placeholder="Options separated by | (e.g. Yes|No|Maybe)"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 flex-shrink-0">
                        Correct option (0 = first):
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={9}
                        value={newQ[quiz.id]?.correctIndex ?? 0}
                        onChange={(e) => setNewQ((p) => ({ ...p, [quiz.id]: { ...p[quiz.id], correctIndex: Number(e.target.value) } }))}
                        className="border rounded px-2 py-1 w-16 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddQuestion(quiz.id)}
                        className="ml-auto flex items-center gap-1 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
