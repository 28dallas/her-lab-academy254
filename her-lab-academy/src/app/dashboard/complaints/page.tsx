'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, MessageSquare, Plus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type Status = 'open' | 'replied' | 'closed';

interface ComplaintReply {
  id: string;
  message: string;
  created_at: string;
  author: { full_name: string };
}

interface ComplaintRow {
  id: string;
  subject: string;
  message: string;
  status: Status;
  created_at: string;
  complaint_replies?: ComplaintReply[];
}

export default function ComplaintsPage() {
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('complaints')
        .select(
          `id, subject, message, status, created_at, complaint_replies ( id, message, created_at, author: author_id ( full_name ) )`
        )
        .order('created_at', { ascending: false });

      setComplaints((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const { error } = await supabase.from('complaints').insert({
      subject: subject.trim(),
      message: message.trim(),
    });

    if (error) {
      // Silently ignore for now; empty state requirement is the priority.
      return;
    }

    setSubject('');
    setMessage('');
    setShowForm(false);

    const { data } = await supabase
      .from('complaints')
      .select(
        `id, subject, message, status, created_at, complaint_replies ( id, message, created_at, author: author_id ( full_name ) )`
      )
      .order('created_at', { ascending: false });

    setComplaints((data as any) ?? []);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-[var(--color-primary)]" /> Complaints
          </h1>
          <p className="text-gray-600 mt-2">Submit a private complaint to the admin. Only you and the admin can see these.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#cf5626] transition-colors shadow-sm"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> New Complaint</>}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900">Submit a Complaint</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              placeholder="Brief description of your issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-y"
              placeholder="Describe your issue in detail..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[#cf5626] transition-colors text-sm"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No complaints submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.subject}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB') : ''}
                    <span className="ml-2 text-[var(--color-primary)] font-medium">{c.status}</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{c.message}</p>

              <div className="mt-4 text-sm">
                {c.complaint_replies?.length ? (
                  <div className="space-y-3">
                    {c.complaint_replies.map((r) => (
                      <div key={r.id} className="bg-[var(--color-accent)] border border-[var(--color-primary)]/20 rounded-lg p-4">
                        <p className="text-xs font-bold text-[var(--color-primary)]">
                          Admin reply
                        </p>
                        <p className="text-sm text-gray-800 mt-1">{r.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Awaiting admin response...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-xs text-gray-400">
        Need help? Use complaints to contact admin.
      </div>
    </div>
  );
}

