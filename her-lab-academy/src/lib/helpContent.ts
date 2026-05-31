/**
 * Shared Help & FAQs content — used by dashboard Help and aligned with chatbot institution KB.
 */

import { BRAND_NAME } from '@/lib/brand';
import {
  HER_LAB_MAJORS,
  HER_LAB_MANDATORY_CORE,
  HER_LAB_MINORS,
  HER_LAB_PROGRAM,
  PROH_IMPACT,
  PROH_PILLARS,
  PROH_PROFILE,
  VERIFIED_PARTNERS,
  getPortalProgramList,
} from '@/lib/chatbot/institution';

export type HelpFaq = { q: string; a: string };

export type HelpSection = {
  id: string;
  title: string;
  description: string;
  faqs: HelpFaq[];
};

export const HELP_CONTACT = {
  email: PROH_PROFILE.email,
  phone: PROH_PROFILE.phone,
  phoneTel: '+254724578225',
  website: PROH_PROFILE.website,
  address: PROH_PROFILE.postalAddress,
  organizationName: PROH_PROFILE.officialName,
} as const;

export const HELP_INSTITUTION_FAQS: HelpFaq[] = [
  {
    q: 'What is Perur Rays of Hope?',
    a: `${PROH_PROFILE.officialName} (${PROH_PROFILE.shortName}) is a ${PROH_PROFILE.entityType} founded in ${PROH_PROFILE.foundedYear} and formally registered in ${PROH_PROFILE.registeredYear}, based in ${PROH_PROFILE.location}. Vision: ${PROH_PROFILE.vision} Mission: ${PROH_PROFILE.mission}`,
  },
  {
    q: 'What is HER Lab?',
    a: `${HER_LAB_PROGRAM.name} is a ${HER_LAB_PROGRAM.duration} run by ${PROH_PROFILE.officialName}. ${HER_LAB_PROGRAM.relationToProh} Training is ${HER_LAB_PROGRAM.cost}. ${HER_LAB_PROGRAM.digitalExtension}`,
  },
  {
    q: 'Who can apply for HER Lab?',
    a: HER_LAB_PROGRAM.targetDemographics +
      ` Selection is coordinated by PRoH coordinators — not through this website alone. Contact ${PROH_PROFILE.email} or ${PROH_PROFILE.phone} for intake questions. This portal is for students who already have an enrollment code.`,
  },
  {
    q: 'How much do HER Lab programs cost?',
    a: `Sponsored HER Lab cohorts are ${HER_LAB_PROGRAM.cost.toLowerCase()}. HER Lab Academy (this website) has no payment flow — it is the free digital learning portal for enrolled students.`,
  },
  {
    q: 'Where is training located?',
    a: `${PROH_PROFILE.officialName} is based in ${PROH_PROFILE.location} (${PROH_PROFILE.postalAddress}). HER Lab technical training is anchored at ${HER_LAB_PROGRAM.trainingLocations.join(' and ')}. Enrolled students can also learn online through HER Lab Academy from anywhere with internet access.`,
  },
  {
    q: 'What impact has Perur Rays of Hope achieved?',
    a: `Official impact highlights: ${PROH_IMPACT.childrenSupported} children supported; ${PROH_IMPACT.youthSkilled} youth skilled (${PROH_IMPACT.youthSkilledNote}); ${PROH_IMPACT.womenInSavingsGroups} women in structured savings groups; ${PROH_IMPACT.treesPlanted} trees planted for environmental restoration.`,
  },
  {
    q: 'Who are your strategic partners?',
    a: `Key partners include ${VERIFIED_PARTNERS.join(', ')}. HER Lab is delivered with Global Give Back Circle and Mastercard Foundation support.`,
  },
  {
    q: 'What curriculum does HER Lab offer?',
    a: `Mandatory core skills include ${HER_LAB_MANDATORY_CORE.join('; ')}. TVET majors include ${HER_LAB_MAJORS.join('; ')}. Minors include ${HER_LAB_MINORS.join('; ')}. This e-learning portal may host online versions of tracks such as: ${getPortalProgramList()}.`,
  },
  {
    q: 'What are PRoH’s core pillars?',
    a: PROH_PILLARS.map((p, i) => `${i + 1}. ${p}`).join(' '),
  },
  {
    q: 'How can I donate or partner with PRoH?',
    a: `Visit the official website at ${PROH_PROFILE.website} and use Donate or Become a Partner. You can also email ${PROH_PROFILE.email} or call ${PROH_PROFILE.phone}.`,
  },
];

export const HELP_PORTAL_FAQS: HelpFaq[] = [
  {
    q: 'How do I enroll in a course on this portal?',
    a: 'You need an enrollment code from your administrator or teacher (format: 1–3 uppercase letters + 5 digits, e.g. EI12345). Go to the Register page, enter your details and code, and you will be enrolled automatically.',
  },
  {
    q: 'How is my progress tracked?',
    a: 'Every time you open or view a resource inside a module, it is marked as viewed. Your progress percentage is the number of viewed resources divided by the total resources in the course.',
  },
  {
    q: 'When do I get my certificate?',
    a: 'Your certificate is issued automatically once you reach 100% progress in a course. Download it from Dashboard → Certificates.',
  },
  {
    q: 'How do I evaluate my lecturer?',
    a: 'After completing 100% of a course, the Evaluate Lecturer option unlocks. Find it in your course Grades tab or from the Quick Access grid on your dashboard.',
  },
  {
    q: 'Can other students see my complaints?',
    a: 'No. Complaints are completely private between you and the admin. No other student or teacher can see what you submit.',
  },
  {
    q: 'What if a resource link is broken?',
    a: 'Submit a complaint through Dashboard → Complaints. Describe the course, module, and resource. An admin will fix it and reply to you directly.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to My Profile from the Quick Access grid or sidebar. Scroll to Change Password, enter your new password, and click Update Password.',
  },
  {
    q: 'The platform is slow on my phone. What can I do?',
    a: 'HER Lab Academy is optimised for low-bandwidth connections. Use Wi-Fi when possible. PDFs open in a new tab to save data. Videos only play when you tap them — they never autoplay.',
  },
];

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'organization',
    title: 'Perur Rays of Hope & HER Lab',
    description: 'About our organization, flagship program, partners, and impact.',
    faqs: HELP_INSTITUTION_FAQS,
  },
  {
    id: 'portal',
    title: `Using ${BRAND_NAME}`,
    description: 'How to enroll, track progress, certificates, and get technical help on this portal.',
    faqs: HELP_PORTAL_FAQS,
  },
];
