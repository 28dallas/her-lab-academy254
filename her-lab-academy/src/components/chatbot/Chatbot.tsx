'use client';

import { useEffect, useState } from 'react';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState<string | null>(null);

  // Ensure this component always renders and is easy to test.
  useEffect(() => {
    // Placeholder UI. Wire up your real chatbot provider here.
  }, []);


  return (
    <div className="fixed bottom-6 right-6 z-50">
      {reply && (
        <div className="mb-3 bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden w-80">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">Chatbot</div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setReply(null)}
              type="button"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="p-3 text-sm text-gray-700">
            <div className="mb-2">
              <span className="font-medium text-gray-900">You:</span> {message}
            </div>
            <div>
              <span className="font-medium text-gray-900">Bot:</span> {reply}
            </div>
          </div>
        </div>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:bg-[#cf5626] transition-colors flex items-center justify-center"
          aria-label="Open chatbot"
        >
          💬
        </button>
      ) : (
        <div className="bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden w-80">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">Chatbot</div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="p-3">
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="chatbot-input">
              Ask a question
            </label>
            <input
              id="chatbot-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="e.g. How do I enroll?"
            />
            <button
              type="button"
              onClick={() => {
                const m = message.trim();
                if (!m) return;
                // Temporary local response until you connect a real provider.
                setReply(`Thanks! For now, this is a placeholder chatbot. You asked: “${m}”.`);
              }}
              className="mt-3 w-full py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[#cf5626] transition-colors"
            >
              Send
            </button>
            <p className="mt-2 text-[11px] text-gray-500">
              This is a lightweight placeholder. Connect your real chatbot provider later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

