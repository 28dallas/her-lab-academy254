'use client';

import React, { useState } from 'react';
import { Award, Plus, Download, CheckCircle2 } from 'lucide-react';
import { issueCertificateManually } from '@/app/actions/admin';

export interface CertRow {
  id: string;
  issued_at: string;
  certificate_url: string | null;
  student: { id: string; full_name: string | null; email: string | null } | null;
  course: { id: string; title: string } | null;
}

export default function AdminCertificatesClient({
  certificates,
  courses,
  students,
}: {
  certificates: CertRow[];
  courses: { id: string; title: string }[];
  students: { id: string; full_name: string | null; email: string | null }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('studentId', studentId);
    fd.set('courseId', courseId);
    const result = await issueCertificateManually(fd);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setShowForm(false);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Award className="w-8 h-8 text-[var(--color-primary)]" /> Certificates
          </h1>
          <p className="text-gray-600 mt-2">All issued certificates. Issue manually when needed.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg text-sm font-medium"
        >
          {showForm ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4" /> Issue Manually
            </>
          )}
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
          <CheckCircle2 className="w-4 h-4" /> Certificate issued.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleIssue} className="bg-white border rounded-xl p-6 mb-8 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name ?? s.email}
              </option>
            ))}
          </select>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm">
            Generate PDF & Issue
          </button>
        </form>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl">
          <p className="text-gray-500">No certificates issued yet.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {certificates.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-semibold">{cert.student?.full_name ?? 'Student'}</p>
                <p className="text-sm text-gray-500">
                  {cert.course?.title} ·{' '}
                  {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('en-GB') : ''}
                </p>
              </div>
              {cert.certificate_url && (
                <a
                  href={cert.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[var(--color-primary)]"
                >
                  <Download className="w-4 h-4" /> PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
