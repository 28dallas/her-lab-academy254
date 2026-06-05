'use client';

import React, { useRef, useState } from 'react';
import { Users, UserCheck, Trash2 } from 'lucide-react';
import { AvatarFallback } from '@/components/ui/AvatarFallback';
import { createStudent, updateUserRole, sendAdminPasswordReset, deleteUser } from '@/app/actions/admin';
import { parseStudentCsv } from '@/lib/importStudentsCsv';

export interface CourseOption { id: string; title: string; }
export interface UserRow { id: string; student_code?: string | null; full_name: string | null; email: string | null; role: string; created_at: string; }

const inp = 'mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm';
const lbl = 'block text-sm font-medium text-[var(--color-text-muted)]';

export default function AdminUsersClient({ users: initialUsers, courses }: { users: UserRow[]; courses: CourseOption[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [importCourseId, setImportCourseId] = useState(courses[0]?.id ?? '');
  const [phone, setPhone] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = users.filter((u) =>
    (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.student_code ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, role: string) => {
    setError(''); setSuccessMessage('');
    const fd = new FormData(); fd.set('userId', userId); fd.set('role', role);
    const result = await updateUserRole(fd);
    if (result.error) { setError(result.error); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
  };

  const handleSendReset = async (userId: string) => {
    setError(''); setSuccessMessage('');
    const fd = new FormData(); fd.set('userId', userId);
    const result = await sendAdminPasswordReset(fd);
    if (result.error) { setError(result.error); return; }
    setSuccessMessage('Password reset email sent successfully.');
  };

  const handleCreateStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setSuccessMessage(''); setSavingStudent(true);
    const formData = new FormData();
    formData.set('fullName', fullName); formData.set('email', email);
    formData.set('studentId', studentId); formData.set('courseId', courseId); formData.set('phone', phone);
    const result = await createStudent(formData);
    setSavingStudent(false);
    if (result.error) { setError(result.error); return; }
    setSuccessMessage('Student added and enrolled successfully. A password reset email has been sent.');
    setFullName(''); setEmail(''); setStudentId(''); setPhone(''); setCourseId(courses[0]?.id ?? '');
    window.location.reload();
  };

  const handleCsvImport = async (file: File) => {
    setError(''); setSuccessMessage(''); setImporting(true);
    if (!importCourseId) {
      setError('Select a course before importing.');
      setImporting(false);
      return;
    }
    const text = await file.text();
    const rows = parseStudentCsv(text);
    if (rows.length === 0) {
      setError(
        'Unable to parse CSV. Include columns for name and student ID (e.g. full_name + student_code, or CANDIDATE NAME + TVET CDACC REG. NO.).'
      );
      setImporting(false);
      return;
    }
    const response = await fetch('/api/admin/import-students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ courseId: importCourseId, students: rows }),
    });
    const result = await response.json();
    setImporting(false);
    if (!response.ok) { setError(result.error || 'Student import failed.'); return; }
    const courseLabel = result.courseTitle ? ` into ${result.courseTitle}` : '';
    const summary = `Created ${result.created ?? 0}, enrolled ${result.enrolled ?? 0}${courseLabel}. ${result.skipped ?? 0} skipped.`;
    if (result.errors?.length) {
      setError(`${summary} ${result.errors.slice(0, 5).join(' ')}${result.errors.length > 5 ? ' …' : ''}`);
    } else {
      setSuccessMessage(summary);
    }
    if ((result.created ?? 0) > 0 || (result.enrolled ?? 0) > 0) window.location.reload();
  };

  const downloadImportTemplate = () => {
    const csv = `full_name,student_code,email,phone
Jane Doe,02400004/ICT/4/2026/019,,
John Example,02400004/ICT/4/2026/020,john@example.com,+254712345678
`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'her-lab-students-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) { setError('Please upload a CSV file.'); return; }
    await handleCsvImport(file);
    event.target.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <Users className="w-8 h-8 text-[var(--color-primary)]" /> Manage Users
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">View users and assign roles (student, teacher, admin).</p>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}
      {successMessage && <p className="text-sm text-green-400 bg-green-900/20 border border-green-500/30 px-3 py-2 rounded-lg">{successMessage}</p>}

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)] mb-4">Add student</h2>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div><label className={lbl}>Full name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inp} placeholder="Student name" required /></div>
            <div><label className={lbl}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} placeholder="student@example.com" required /></div>
            <div><label className={lbl}>Student ID</label><input value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inp} placeholder="e.g. 02400004/ICT/4/2026/019" required /></div>
            <div>
              <label className={lbl}>Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inp} required>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Phone (optional)</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} placeholder="+254712345678" /></div>
            <p className="text-sm text-[var(--color-text-muted)]">Student will receive a password reset email.</p>
            <button type="submit" disabled={savingStudent} className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
              {savingStudent ? 'Saving…' : 'Add student'}
            </button>
          </form>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">Bulk import (one CSV per course)</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Export your Excel register as CSV. Required columns:{' '}
            <span className="font-medium text-[var(--color-text)]">name + student ID</span>{' '}
            (e.g. <span className="font-mono text-xs">CANDIDATE NAME</span> and{' '}
            <span className="font-mono text-xs">TVET CDACC REG. NO.</span>). Email is optional — a login email is generated from the student ID when blank.
          </p>
          <div>
            <label className={lbl}>Enroll into course</label>
            <select
              value={importCourseId}
              onChange={(e) => setImportCourseId(e.target.value)}
              className={inp}
              disabled={courses.length === 0}
            >
              {courses.length === 0 ? (
                <option value="">No courses — create one first</option>
              ) : (
                courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing || !importCourseId}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
            >
              {importing ? 'Importing…' : 'Import CSV'}
            </button>
            <button
              type="button"
              onClick={downloadImportTemplate}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            >
              Download template
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          <p className="text-xs text-[var(--color-text-muted)]">
            Students log in with their TVET registration number (or email if provided) and password. Bulk import needs{' '}
            <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> on the server (Vercel env).
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or student ID..."
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <UserCheck className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
            <p className="text-[var(--color-text-muted)]">No users found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((u) => (
              <div key={u.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <AvatarFallback name={u.full_name ?? u.email ?? 'User'} size="md" />
                  <div>
                    <p className="font-semibold text-[var(--color-text-dark)]">{u.full_name ?? '—'}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{u.email}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">ID: <span className="font-mono text-[var(--color-text)]">{u.student_code ?? u.id}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm capitalize">
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                    <option value="admin">admin</option>
                  </select>
                  <button type="button" onClick={() => handleSendReset(u.id)}
                    className="text-sm text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors rounded-lg px-3 py-1.5">
                    Reset password
                  </button>
                  <button type="button" onClick={async () => {
                    if (!confirm(`Delete ${u.full_name ?? u.email}? This cannot be undone.`)) return;
                    const fd = new FormData(); fd.set('userId', u.id);
                    const result = await deleteUser(fd);
                    if (result.error) { setError(result.error); return; }
                    setUsers((prev) => prev.filter((x) => x.id !== u.id));
                  }} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg" title="Delete user">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
