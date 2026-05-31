import { CHATBOT_PERSONALITY, getInstitutionKnowledgeBlock } from './institution';

export function buildChatbotSystemPrompt(options: {
  publishedCourseTitles: string[];
  userName?: string | null;
  userRole?: string | null;
}): string {
  const published =
    options.publishedCourseTitles.length > 0
      ? options.publishedCourseTitles.join(', ')
      : 'No published courses are listed yet — check the Programs page (/courses).';

  const userLine = options.userName
    ? `The visitor is signed in as ${options.userName}${options.userRole ? ` (${options.userRole})` : ''}.`
    : 'The visitor is not signed in.';

  return `${CHATBOT_PERSONALITY}

${userLine}

${getInstitutionKnowledgeBlock()}

## Live portal data (updates per request)
- Currently published online courses: ${published}

Keep answers concise (2–4 short paragraphs unless listing programs). Separate HER Lab (in-person, PRoH/Morpus) from Her Lab Academy (this website) when relevant.`;
}
