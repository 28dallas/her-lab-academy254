'use client';

import React, { useState } from 'react';
import { Bell, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminNoticesPage() {
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
            <Bell className="w-8 h-8 text-[var(--color-primary)]" /> Platform Notices
          </h1>
          <p className="text-gray-600 mt-2">Notices appear on all student dashboards.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#cf5626] transition-colors shadow-sm"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> New Notice</>}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" /> Notice posted successfully.
        </div>
      )}

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowForm(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-gray-900">Post a New Notice</h3>
          <p className="text-sm text-gray-500">Form submission is not wired yet.</p>
        </form>
      )}

      <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No notices posted yet.</p>
      </div>
    </div>
  );
}

