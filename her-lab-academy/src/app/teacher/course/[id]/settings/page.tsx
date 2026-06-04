'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { updateCourseSettings } from '@/app/actions/teacher';

const inp = 'w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg-muted)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-shadow';
const lbl = 'block text-sm font-medium text-[var(--color-text)] mb-1.5';

export default function TeacherCourseSettings({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('');
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('courses').select('title, description, duration_weeks, enrollment_code').eq('id', params.id).single();
      if (data) {
        setTitle(data.title ?? ''); setDescription(data.description ?? '');
        setDurationWeeks(data.duration_weeks ? String(data.duration_weeks) : '');
        setEnrollmentCode(data.enrollment_code ?? '');
      }
      setLoading(false);
    })();
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const fd = new FormData();
    fd.set('title', title); fd.set('description', description);
    fd.set('durationWeeks', durationWeeks); fd.set('enrollmentCode', enrollmentCode);
    const result = await updateCourseSettings(params.id, fd);
    if (result.error) { setError(result.error); return; }
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="max-w-2xl mx-auto py-12 text-center text-[var(--color-text-muted)]">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <Settings className="w-7 h-7 text-[var(--color-primary)]" /> Course Settings
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">Edit course information. Contact admin to change publish status.</p>
      </div>

      {error && <p className="alert-error mb-4">{error}</p>}
      {saved && (
        <div className="flex items-center gap-2 alert-success mb-6">
          <CheckCircle2 className="w-4 h-4" /> Settings saved.
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-6 space-y-5">
        <div><label className={lbl}>Course Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inp} /></div>
        <div><label className={lbl}>Description</label><textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inp} resize-y`} /></div>
        <div><label className={lbl}>Duration (weeks)</label><input type="number" min={1} value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Enrollment Code</label><input type="text" value={enrollmentCode} onChange={(e) => setEnrollmentCode(e.target.value.toUpperCase())} className={`${inp} font-mono uppercase`} /></div>
        <button type="submit" className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-primary-hover)] shadow-sm">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </form>
    </div>
  );
}
