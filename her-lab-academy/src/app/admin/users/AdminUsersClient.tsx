'use client';

import React, { useRef, useState } from 'react';
import { Users, UserCheck, Trash2 } from 'lucide-react';
import { AvatarFallback } from '@/components/ui/AvatarFallback';
import { createStudent, updateUserRole, sendAdminPasswordReset, deleteUser } from '@/app/actions/admin';

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => normalizeHeader(h.replace(/^"|"$/g, '')));
  return lines.slice(1).map((line) => {
    const values = Array.from(line.match(/"[^"]*"|[^,]+/g) || []).map((v) => v.trim().replace(/^"|"$/g, ''));
    return headers.reduce<Record<string, string>>((acc, h, i) => { acc[h] = values[i]?.trim() ?? ''; return acc; }, {});
  });
}

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
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) { setError('Unable to parse CSV. Make sure it has a header row and at least one student.'); setImporting(false); return; }
    const normalizedRows = rows.map((row) => ({
      full_name: row.full_name || row.name || row.fullname || '',
      email: row.email || row.email_address || '',
      student_code: row.student_code || row.studentid || row.student_id || '',
      phone: row.phone || row.phone_number || '',
    }));
    const response = await fetch('/api/admin/import-students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ students: normalizedRows }) });
    const result = await response.json();
    setImporting(false);
    if (!response.ok) { setError(result.error || 'Student import failed.'); return; }
    if (result.errors?.length) setError(`Imported ${result.created ?? 0}, skipped ${result.skipped ?? 0}. ${result.errors.join(' ')}`);
    else setSuccessMessage(`Imported ${result.created ?? 0} students. ${result.skipped ?? 0} skipped.`);
    if (result.created) window.location.reload();
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
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Upload a CSV with columns: <span className="font-medium text-[var(--color-text)]">full_name, email, student_code</span>.
          </p>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={importing}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {importing ? 'Importing…' : 'Import students CSV'}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
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
