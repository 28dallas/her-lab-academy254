'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Karibu! I know about Perur Rays of Hope, HER Lab, our programs, partners, and this learning portal. Ask about enrollment, eligibility, locations, or how to use the site.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const historyForApi = [...messages, userMsg].filter((m) => m.role === 'user' || m.role === 'assistant');

    setInput('');
    setError(null);
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyForApi.slice(0, -1),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? 'Could not get a reply');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply ?? 'Sorry, I had trouble answering that.' },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not reach the server. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:bg-[#cf5626] transition-colors flex items-center justify-center"
          aria-label="Open Her Lab assistant"
        >
          <MessageCircle className="w-6 h-6" aria-hidden />
        </button>
      ) : (
        <div className="bg-white shadow-xl border border-gray-200 rounded-2xl overflow-hidden w-[min(100vw-2rem,22rem)] flex flex-col max-h-[min(32rem,70vh)]">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
            <div>
              <div className="text-sm font-semibold text-gray-800">HER Lab Assistant</div>
              <div className="text-[10px] text-gray-500">PRoH · HER Lab · HER Lab University</div>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700 p-1"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[12rem]">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`text-sm rounded-xl px-3 py-2 max-w-[90%] ${
                  m.role === 'user'
                    ? 'ml-auto bg-[var(--color-primary)] text-white'
                    : 'mr-auto bg-gray-100 text-gray-800'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto text-xs text-gray-500 px-2">Thinking…</div>
            )}
          </div>

          {error && (
            <p className="px-3 pb-1 text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="p-3 border-t border-gray-100 shrink-0">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-60"
                placeholder="e.g. How do I enroll?"
                aria-label="Your message"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 p-2 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50 hover:bg-[#cf5626] transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
