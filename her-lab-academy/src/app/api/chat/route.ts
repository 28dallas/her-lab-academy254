import { NextResponse } from 'next/server';
import { getChatbotReply, type ChatMessage } from '@/lib/chatbot/respond';
import { getPublishedCourses } from '@/lib/courses';
import { createClient } from '@/utils/supabase/server';

const MAX_MESSAGE_LEN = 800;
const MAX_HISTORY = 12;

function sanitizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const item of raw.slice(-MAX_HISTORY)) {
    if (
      item &&
      typeof item === 'object' &&
      (item as ChatMessage).role &&
      typeof (item as ChatMessage).content === 'string'
    ) {
      const role = (item as ChatMessage).role;
      if (role !== 'user' && role !== 'assistant') continue;
      const content = (item as ChatMessage).content.trim().slice(0, MAX_MESSAGE_LEN);
      if (content) out.push({ role, content });
    }
  }
  return out;
}

export async function POST(request: Request) {
  let body: { message?: string; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 });
  }

  const history = sanitizeHistory(body.history);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userName: string | null = null;
  let userRole: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle();
    userName = profile?.full_name ?? user.email ?? null;
    userRole = profile?.role ?? null;
  }

  const courses = await getPublishedCourses();
  const publishedCourseTitles = courses.map((c) => c.title);

  const { reply, source } = await getChatbotReply(message, history, {
    publishedCourseTitles,
    userName,
    userRole,
  });

  return NextResponse.json({ reply, source });
}
