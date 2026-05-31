import { COURSE_ENROLLMENT_PREFIXES } from '@/lib/courseEnrollmentPrefixes';
import {
  HER_LAB_PROGRAM,
  matchInstitutionFaq,
  PROH_PROFILE,
  PROH_IMPACT,
  VERIFIED_PARTNERS,
  getPortalProgramList,
} from './institution';

const PROGRAMS = Object.keys(COURSE_ENROLLMENT_PREFIXES).join(', ');

function includesAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

export function getFaqReply(
  message: string,
  publishedCourseTitles: string[]
): string {
  const q = message.toLowerCase().trim();

  const institutional = matchInstitutionFaq(message);
  if (institutional) return institutional;

  if (includesAny(q, ['hello', 'hi', 'hey', 'good morning', 'good afternoon'])) {
    return `Hello! I'm the Her Lab Assistant for ${PROH_PROFILE.officialName}. I can tell you about HER Lab, our impact, partners, enrollment, and how to use this learning portal. What would you like to know?`;
  }

  if (includesAny(q, ['enroll', 'registration', 'register', 'sign up', 'signup', 'join', 'portal'])) {
    if (includesAny(q, ['her lab program', 'apply', 'cohort', 'intake', 'asal'])) {
      return matchInstitutionFaq('who can apply')!;
    }
    return `To use **HER Lab Academy** (this website), go to Register with your enrollment code (PREFIX + 5 digits, e.g. EI12345). Codes are issued by coordinators for published courses. Browse programs at /courses. Supported tracks: ${PROGRAMS}. For **HER Lab in-person intake** (not the website), contact ${PROH_PROFILE.email} or ${PROH_PROFILE.phone}.`;
  }

  if (includesAny(q, ['code', 'prefix', 'format'])) {
    return `Enrollment codes on this portal: 1–3 uppercase letters + 5 digits (e.g. ICT12345). Prefixes include EI (Electrical), ICT, SM (Soap Making), and others. Ask your coordinator for your code. Full list: ${getPortalProgramList()}.`;
  }

  if (includesAny(q, ['login', 'log in', 'password', 'forgot', 'reset'])) {
    return 'Sign in at /login. Forgot password? Use /forgot-password. New students need an enrollment code at /register. For account issues after registering, use Dashboard → Help or email ' + PROH_PROFILE.email + '.';
  }

  if (includesAny(q, ['course', 'program', 'catalog', 'what do you offer', 'classes', 'online'])) {
    if (publishedCourseTitles.length > 0) {
      return `**On this portal now:** ${publishedCourseTitles.join(', ')} — see /courses. **HER Lab & PRoH training areas** include ICT, electrical, solar, plumbing, cosmetology, fashion, agriculture, entrepreneurship, beadwork, and more. Portal tracks when courses are published: ${PROGRAMS}.`;
    }
    return `Visit /courses for published online programs. ${HER_LAB_PROGRAM.name} covers majors such as ICT, electrical, solar, plumbing, cosmetology, fashion, and cookery, plus core digital literacy and entrepreneurship. Portal can host: ${PROGRAMS}. Contact ${PROH_PROFILE.email} if no courses appear yet.`;
  }

  if (includesAny(q, ['certificate', 'cert', 'complete', 'graduation', 'graduate'])) {
    return 'On HER Lab Academy, certificates generate automatically at 100% course progress (view under Dashboard → Certificates). HER Lab in-person graduation ceremonies are separate — ask coordinators about cohort graduations.';
  }

  if (includesAny(q, ['teacher', 'instructor', 'faculty', 'lecturer'])) {
    return 'Teachers manage outlines, resources, announcements, student progress, quizzes, and forums from the teacher dashboard after sign-in.';
  }

  if (includesAny(q, ['admin', 'administrator'])) {
    return 'Admins manage courses, enrollment codes, users, notices, complaints, certificates, and surveys.';
  }

  if (includesAny(q, ['complaint', 'problem', 'issue', 'support', 'help desk', 'broken'])) {
    return `Logged-in students: Dashboard → Complaints (private, admin-only). Platform help: Dashboard → Help. Organization-wide: ${PROH_PROFILE.email}, ${PROH_PROFILE.phone}, or ${PROH_PROFILE.website}`;
  }

  if (includesAny(q, ['forum', 'discussion', 'ask teacher'])) {
    return 'Each enrolled course has a forum. Post from your course page; teachers reply and can mark topics answered.';
  }

  if (includesAny(q, ['quiz', 'test', 'exam'])) {
    return 'Some courses include teacher-created quizzes. Open your course from the dashboard to find them in modules.';
  }

  if (includesAny(q, ['email', 'phone', 'contact', 'call', 'reach'])) {
    return `**${PROH_PROFILE.officialName}** — Email: ${PROH_PROFILE.email} | Phone: ${PROH_PROFILE.phone} | Web: ${PROH_PROFILE.website} | Address: ${PROH_PROFILE.postalAddress}`;
  }

  if (includesAny(q, ['website', 'official', 'perurraysofhope'])) {
    return `Official website: ${PROH_PROFILE.website} — donate, partner, and news. This app (HER Lab Academy) is the student e-learning portal.`;
  }

  if (includesAny(q, ['who', 'about', 'her lab academy', 'proh', 'perur', 'rays of hope'])) {
    return `${PROH_PROFILE.officialName} (${PROH_PROFILE.shortName}) — ${PROH_PROFILE.entityType}, founded ${PROH_PROFILE.foundedYear}, registered ${PROH_PROFILE.registeredYear}. Mission: ${PROH_PROFILE.mission} HER Lab Academy is the online portal; ${HER_LAB_PROGRAM.name} is the 12-month in-person flagship in West Pokot. Impact: ${PROH_IMPACT.childrenSupported} children, ${PROH_IMPACT.youthSkilled} youth skilled, ${PROH_IMPACT.womenInSavingsGroups} women in savings groups, ${PROH_IMPACT.treesPlanted} trees planted.`;
  }

  if (includesAny(q, ['partner', 'ggbc', 'mastercard', 'funder'])) {
    return `Partners include ${VERIFIED_PARTNERS.join(', ')}. HER Lab is supported by Global Give Back Circle and the Mastercard Foundation.`;
  }

  if (includesAny(q, ['progress', 'module', 'resource', 'slow', 'bandwidth', 'phone'])) {
    return 'Progress is tracked when you view course resources. The platform is optimized for low bandwidth — PDFs open in a new tab; videos play only when you tap them.';
  }

  return `I can help with ${PROH_PROFILE.officialName}, HER Lab, partners, impact figures, enrollment, and using HER Lab Academy. Try asking about eligibility, program cost, locations, or how to register. For your question ("${message.trim()}"), email ${PROH_PROFILE.email} if you need personal follow-up.`;
}
