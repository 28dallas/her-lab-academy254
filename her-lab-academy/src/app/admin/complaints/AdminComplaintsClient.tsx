'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Send,
} from 'lucide-react';
import { AvatarFallback } from '@/components/ui/AvatarFallback';
import { replyToComplaint, updateComplaintStatus } from '@/app/actions/admin';

type Status = 'open' | 'replied' | 'closed';

export interface ComplaintRow {
  id: string;
  subject: string;
  message: string;
  status: Status;
  created_at: string;
  student: { full_name: string | null; email: string | null } | null;
  complaint_replies: {
    id: string;
    message: string;
    created_at: string;
    author: { full_name: string | null } | null;
  }[];
}

export default function AdminComplaintsClient({
  complaints: initial,
}: {
  complaints: ComplaintRow[];
}) {
  const [complaints, setComplaints] = useState(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const handleReply = async (complaintId: string) => {
    const message = replyText[complaintId]?.trim();
    if (!message) return;
    setSaving(complaintId);
    setError('');

    const fd = new FormData();
    fd.set('complaintId', complaintId);
    fd.set('message', message);

    const result = await replyToComplaint(fd);
    setSaving(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    window.location.reload();
  };

  const handleStatus = async (complaintId: string, status: Status) => {
    const fd = new FormData();
    fd.set('complaintId', complaintId);
    fd.set('status', status);
    const result = await updateComplaintStatus(fd);
    if (result.error) {
      setError(result.error);
      return;
    }
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status } : c))
    );
  };

  const openCount = complaints.filter((c) => c.status === 'open').length;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-[var(--color-primary)]" /> Student Complaints
        </h1>
        <p className="text-gray-600 mt-2">
          Review and respond to private student complaints.{' '}
          <span className="font-medium text-[var(--color-primary)]">{openCount} open</span>
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mb-4">
          {error}
        </p>
      )}

      {complaints.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-xl py-16 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No complaints submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const expanded = expandedId === c.id;
            const studentName = c.student?.full_name ?? c.student?.email ?? 'Student';

            return (
              <div
                key={c.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                  className="w-full px-6 py-4 flex items-start justify-between gap-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <AvatarFallback name={studentName} size="md" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.subject}</h3>
                      <p className="text-sm text-gray-500">{studentName}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString('en-GB')
                          : ''}
                        <span
                          className={`ml-2 font-medium capitalize ${
                            c.status === 'open'
                              ? 'text-orange-600'
                              : c.status === 'closed'
                                ? 'text-gray-500'
                                : 'text-green-600'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {expanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {expanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <p className="mt-4 text-sm text-[var(--color-text)] whitespace-pre-wrap">{c.message}</p>

                    {c.complaint_replies?.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {c.complaint_replies.map((r) => (
                          <div
                            key={r.id}
                            className="bg-[var(--color-accent)] border border-[var(--color-primary)]/20 rounded-lg p-4"
                          >
                            <p className="text-xs font-bold text-[var(--color-primary)]">
                              Admin — {r.author?.full_name ?? 'Admin'}
                            </p>
                            <p className="text-sm text-gray-800 mt-1">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(['open', 'replied', 'closed'] as Status[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleStatus(c.id, s)}
                          className={`text-xs px-3 py-1 rounded-full border capitalize ${
                            c.status === s
                              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                              : 'border-gray-200 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      <textarea
                        rows={3}
                        value={replyText[c.id] ?? ''}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                        placeholder="Write your reply to the student..."
                        className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-y"
                      />
                      <button
                        type="button"
                        disabled={saving === c.id}
                        onClick={() => handleReply(c.id)}
                        className="mt-2 flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#cf5626] disabled:opacity-50"
                      >
                        {saving === c.id ? (
                          'Sending...'
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
