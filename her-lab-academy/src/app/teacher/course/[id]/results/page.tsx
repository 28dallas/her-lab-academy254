'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Download, FileUp, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { createResultSlip, deleteResultSlip } from '@/app/actions/teacher';

interface StudentOption {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface ResultSlipRow {
  id: string;
  title: string;
  file_url: string;
  file_size: string | null;
  remarks: string | null;
  issued_at: string;
  student: StudentOption | StudentOption[] | null;
}

export default function TeacherResultsPage({ params }: { params: { id: string } }) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [resultSlips, setResultSlips] = useState<ResultSlipRow[]>([]);
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [remarks, setRemarks] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student:student_id ( id, full_name, email )')
      .eq('course_id', params.id)
      .order('enrolled_at', { ascending: false });

    const studentList = (enrollments ?? [])
      .map((row) => {
        const raw = row.student;
        return Array.isArray(raw) ? raw[0] : raw;
      })
      .filter(Boolean) as StudentOption[];

    setStudents(studentList);
    if (studentList.length && !studentId) setStudentId(studentList[0].id);

    const { data: slips } = await supabase
      .from('result_slips')
      .select('id, title, file_url, file_size, remarks, issued_at, student:student_id ( id, full_name, email )')
      .eq('course_id', params.id)
      .order('issued_at', { ascending: false });

    setResultSlips((slips as ResultSlipRow[]) ?? []);
    setLoading(false);
  }, [params.id, studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError('');

    const body = new FormData();
    body.append('file', file);
    body.append('courseId', params.id);

    const res = await fetch('/api/upload', { method: 'POST', body });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? 'Upload failed');
      return;
    }

    setFileUrl(data.url);
    setFileSize(data.fileSize ?? '');
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fd = new FormData();
    fd.set('studentId', studentId);
    fd.set('title', title);
    fd.set('fileUrl', fileUrl);
    if (fileSize) fd.set('fileSize', fileSize);
    if (remarks) fd.set('remarks', remarks);

    const result = await createResultSlip(params.id, fd);
    if (result.error) {
      setError(result.error);
      return;
    }

    setTitle('');
    setRemarks('');
    setFileUrl('');
    setFileSize('');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this result slip?')) return;
    await deleteResultSlip(params.id, id);
    load();
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto py-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Results Slips</h1>
        <p className="text-gray-600 mt-1">
          Upload student result slips so they appear in the student portal for download.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">Upload Result</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <label className="block text-sm font-medium text-gray-700">
            Student
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {students.length === 0 ? (
                <option value="">No enrolled students</option>
              ) : (
                students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name ?? student.email ?? 'Student'}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Result title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Term 1 Result Slip"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Remarks
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Upload file
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
              }}
              required={!fileUrl}
              className="mt-1 w-full text-sm"
            />
          </label>

          {uploading && (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </p>
          )}
          {fileUrl && <p className="text-xs text-green-600 truncate">Uploaded: {fileUrl}</p>}

          <button
            type="submit"
            disabled={uploading || !students.length}
            className="w-full inline-flex justify-center items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <FileUp className="w-4 h-4" /> Save Result Slip
          </button>
        </form>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {resultSlips.length === 0 ? (
            <div className="py-16 text-center text-gray-500">No result slips uploaded yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {resultSlips.map((slip) => {
                const rawStudent = slip.student;
                const student = Array.isArray(rawStudent) ? rawStudent[0] : rawStudent;
                const studentName = student?.full_name ?? student?.email ?? 'Student';

                return (
                  <div key={slip.id} className="p-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{slip.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{studentName}</p>
                      {slip.remarks && <p className="text-sm text-gray-600 mt-2">{slip.remarks}</p>}
                      <p className="text-xs text-gray-400 mt-2">
                        {slip.issued_at ? new Date(slip.issued_at).toLocaleDateString('en-GB') : ''}
                        {slip.file_size ? ` · ${slip.file_size}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={slip.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)]"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(slip.id)}
                        className="p-1.5 text-red-500 hover:text-red-700"
                        aria-label="Delete result slip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
