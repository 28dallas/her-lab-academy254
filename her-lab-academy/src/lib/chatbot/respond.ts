import { buildChatbotSystemPrompt } from './knowledge';
import { getFaqReply } from './faq';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

export function isOpenAiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}

async function replyWithOpenAi(
  message: string,
  history: ChatMessage[],
  context: {
    publishedCourseTitles: string[];
    userName?: string | null;
    userRole?: string | null;
  }
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const system = buildChatbotSystemPrompt(context);
  const messages = [
    { role: 'system' as const, content: system },
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: message },
  ];

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    console.error('OpenAI chat error', res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function getChatbotReply(
  message: string,
  history: ChatMessage[],
  context: {
    publishedCourseTitles: string[];
    userName?: string | null;
    userRole?: string | null;
  }
): Promise<{ reply: string; source: 'openai' | 'faq' }> {
  if (isOpenAiConfigured()) {
    const ai = await replyWithOpenAi(message, history, context);
    if (ai) return { reply: ai, source: 'openai' };
  }

  return {
    reply: getFaqReply(message, context.publishedCourseTitles),
    source: 'faq',
  };
}
