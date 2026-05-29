'use client';

import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Clock, MessageSquare, CheckCircle2, Send } from 'lucide-react';

type Status = 'open' | 'replied' | 'closed';

export default function AdminComplaintsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-[var(--color-primary)]" /> Student Complaints
        </h1>
        <p className="text-gray-600 mt-2">Review and respond to private student complaints.</p>
      </div>

      <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No complaints to display.</p>
        <p className="text-gray-400 text-sm mt-1">Admin will see real complaints once students submit them.</p>
      </div>
    </div>
  );
}

