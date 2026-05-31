/**
 * Institutional knowledge for Perur Rays of Hope (PRoH) and HER Lab.
 * Sourced from https://perurraysofhopeke.org/ (home, about), press/partner pages,
 * and aligned with this app's HER Lab Academy e-learning portal.
 */

import { COURSE_ENROLLMENT_PREFIXES } from '@/lib/courseEnrollmentPrefixes';

/** Verified on perurraysofhopeke.org (2026). */
export const PROH_PROFILE = {
  officialName: 'Perur Rays of Hope',
  shortName: 'PRoH',
  entityType: 'Registered Community-Based Organization (CBO)',
  foundedYear: 2014,
  registeredYear: 2021,
  location: 'West Pokot County, Kenya',
  postalAddress: 'P.O. Box 0-30600, Kapenguria, West Pokot County, Kenya',
  email: 'info@perurraysofhopeke.org',
  /** Listed in program materials; primary public contact on the website is the contact form and email. */
  phone: '+254 724 578225',
  website: 'https://perurraysofhopeke.org/',
  vision: 'A resilient and empowered community.',
  mission:
    'Safeguarding children, empowering youths and women, and conserving the environment for resilient livelihoods.',
  executiveDirector: 'Caroline Menach (Shujaa Caroline Menach, HSC)',
  executiveTitle: 'Executive Director',
} as const;

export const PROH_IMPACT = {
  childrenSupported: '1,500+',
  youthSkilled: '620+',
  youthSkilledNote: 'young people aged 18+',
  womenInSavingsGroups: '480+',
  treesPlanted: '35,000+',
} as const;

export const PROH_PILLARS = [
  'Child protection and social justice',
  'Youth empowerment and market-relevant skills',
  'Women-led livelihoods and financial inclusion',
  'Environmental conservation and climate action',
] as const;

export const PROH_FOCUS_AREAS = [
  'Empower women and youth through business skills and employability programs',
  'Promote quality education and support retention for vulnerable children',
  'Safeguard children through community-led protection systems',
  'Strengthen household livelihoods through savings and entrepreneurship support',
  'Conserve the environment through climate-smart and restoration initiatives',
] as const;

/** Partners shown on the official website and county press releases. */
export const VERIFIED_PARTNERS = [
  'Global Give Back Circle (GGBC)',
  'Mastercard Foundation',
  'Circle Group Limited (CGL)',
  'International Tree Foundation (ITF)',
  'Mekuno Project',
  'County Government of West Pokot',
] as const;

/**
 * Additional partners sometimes cited in program materials; not all appear on the current website footer.
 * The bot should mention verified partners first.
 */
export const ADDITIONAL_PARTNERS_NOTE =
  'PRoH also collaborates on agriculture and development initiatives with various international partners; confirm current partnerships via the official website or email.';

export const HER_LAB_PROGRAM = {
  name: 'HER Lab',
  relationToProh:
    'Flagship workforce-readiness program run by Perur Rays of Hope as a local implementation partner of the Global Give Back Circle, with support from the Mastercard Foundation (Economic Empowerment 4 HER).',
  duration: '12-month post-secondary bridging and workforce readiness program',
  cost: 'Free (zero cost) for qualifying, financially needy participants in sponsored cohorts',
  targetDemographics:
    'Marginalized young women, typically aged 18–35, from Arid and Semi-Arid Lands (ASAL) counties (e.g. West Pokot, Baringo, Samburu, Turkana) and similar hard-to-reach areas; applicants must demonstrate financial need and commitment to economic self-improvement',
  trainingLocations: [
    'Pokot Technical and Vocational College, Morpus, West Pokot',
    'HER Lab facility in Morpus (Perur Rays of Hope / Morpus area)',
  ],
  digitalExtension:
    'HER Lab Academy is the online learning portal for enrolled students — modules, resources, progress, certificates, and forums.',
} as const;

/** HER Lab / TVET curriculum (in-person program). */
export const HER_LAB_MANDATORY_CORE = [
  'Basic Digital Literacy & Coding',
  'Entrepreneurship & Financial Literacy',
  'Communication, Media & Storytelling',
  'Give Back Commitment & Leadership Skills',
  'Reproductive & Menstrual Health',
  'Core Agriculture',
] as const;

export const HER_LAB_MAJORS = [
  'Information Communication Technology (ICT Operator)',
  'Electrical Installation Technology',
  'Solar Installation Technology',
  'Fashion Design (Sewing & Garment Making)',
  'Plumbing',
  'Food & Beverage Technology (Cookery)',
  'Cosmetology',
] as const;

export const HER_LAB_MINORS = [
  'Drexel Entrepreneurship',
  'Regenerative Agriculture',
  'Beadwork',
] as const;

/** Tracks available on this e-learning portal (enrollment code prefixes). */
export function getPortalProgramList(): string {
  return Object.entries(COURSE_ENROLLMENT_PREFIXES)
    .map(([title, prefix]) => `${title} (${prefix})`)
    .join(', ');
}

export const INSTITUTION_FAQS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['who can apply', 'eligibility', 'qualify', 'age', 'asal', 'refugee'],
    answer: `HER Lab applications are for young women typically aged 18–35 from ASAL counties (such as West Pokot, Baringo, Samburu, Turkana) or similar marginalized contexts. Applicants should show financial need and motivation. Selection is coordinated by PRoH — not through this website alone. Contact ${PROH_PROFILE.email} or ${PROH_PROFILE.phone} for intake. This portal is for students who already have an enrollment code.`,
  },
  {
    keywords: ['cost', 'price', 'fee', 'free', 'pay', 'scholarship'],
    answer: `Sponsored HER Lab cohorts are offered at zero cost to qualifying participants. HER Lab Academy (this website) is the digital learning portal for enrolled students — there is no public payment flow on the portal.`,
  },
  {
    keywords: ['where', 'location', 'facility', 'morpus', 'kapenguria', 'college', 'train'],
    answer: `PRoH is based in West Pokot County, Kenya (${PROH_PROFILE.postalAddress}). HER Lab technical training is anchored in Morpus, including Pokot Technical and Vocational College and the HER Lab facility. HER Lab Academy lets enrolled students learn online from anywhere with internet access.`,
  },
  {
    keywords: ['donate', 'donation', 'partner', 'volunteer', 'support', 'get involved'],
    answer: `Support PRoH via the official website ${PROH_PROFILE.website} — use Donate or Become a Partner. You can also email ${PROH_PROFILE.email} or call ${PROH_PROFILE.phone}.`,
  },
  {
    keywords: ['caroline', 'director', 'ceo', 'leadership', 'staff', 'team'],
    answer: `${PROH_PROFILE.executiveDirector} is the ${PROH_PROFILE.executiveTitle} of Perur Rays of Hope. The leadership team also includes program, finance, and community roles listed on the About page at ${PROH_PROFILE.website}.`,
  },
  {
    keywords: ['impact', 'how many', 'trees', 'children', 'youth', 'women', 'numbers', 'statistics'],
    answer: `PRoH impact highlights: ${PROH_IMPACT.childrenSupported} children supported; ${PROH_IMPACT.youthSkilled} youth skilled (${PROH_IMPACT.youthSkilledNote}); ${PROH_IMPACT.womenInSavingsGroups} women in savings groups; ${PROH_IMPACT.treesPlanted} trees planted.`,
  },
  {
    keywords: ['partner', 'ggbc', 'mastercard', 'funder', 'sponsor', 'affiliate', 'backed'],
    answer: `Key partners include: ${VERIFIED_PARTNERS.join('; ')}. HER Lab is delivered with Global Give Back Circle and Mastercard Foundation support.`,
  },
  {
    keywords: ['her lab', 'what is her', 'flagship', 'bridging', '12 month', '12-month', 'cohort'],
    answer: `${HER_LAB_PROGRAM.name} is a ${HER_LAB_PROGRAM.duration} by ${PROH_PROFILE.officialName}, ${HER_LAB_PROGRAM.relationToProh} Training is ${HER_LAB_PROGRAM.cost}. ${HER_LAB_PROGRAM.digitalExtension}`,
  },
  {
    keywords: ['vision', 'mission', 'pillar', 'values'],
    answer: `Vision: ${PROH_PROFILE.vision} Mission: ${PROH_PROFILE.mission} Core pillars: ${PROH_PILLARS.join('; ')}.`,
  },
  {
    keywords: ['major', 'minor', 'curriculum', 'tvet', 'vocational', 'track', 'cookery', 'food and beverage'],
    answer: `HER Lab includes mandatory core skills (${HER_LAB_MANDATORY_CORE.join('; ')}), TVET majors (${HER_LAB_MAJORS.join('; ')}), and minors (${HER_LAB_MINORS.join('; ')}). This portal may offer a subset as online courses: ${getPortalProgramList()}.`,
  },
  {
    keywords: ['founded', 'registered', '2014', '2021', 'cbo', 'ngo', 'about proh', 'perur rays', 'tell me about'],
    answer: `${PROH_PROFILE.officialName} (${PROH_PROFILE.shortName}) is a ${PROH_PROFILE.entityType} founded in ${PROH_PROFILE.foundedYear} and formally registered in ${PROH_PROFILE.registeredYear}, serving ${PROH_PROFILE.location}. Mission: ${PROH_PROFILE.mission} Contact: ${PROH_PROFILE.email} | ${PROH_PROFILE.phone} | ${PROH_PROFILE.website}`,
  },
];

export const CHATBOT_PERSONALITY = `You are the Her Lab Assistant for Perur Rays of Hope and HER Lab Academy.
Your tone is warm, encouraging, community-focused, and accessible — especially for learners on low-bandwidth connections.
Use only the knowledge provided. Do not invent enrollment codes, dates, fees, or job outcomes.
For portal login/password issues, guide users to /login, /register, /forgot-password, or dashboard Help.
For questions outside your knowledge (specific application status, payroll, legal advice), direct users to ${PROH_PROFILE.email} or ${PROH_PROFILE.phone}, or the official site ${PROH_PROFILE.website}.`;

export function getInstitutionKnowledgeBlock(): string {
  return `
# ${PROH_PROFILE.officialName} (${PROH_PROFILE.shortName})

## Profile
- Type: ${PROH_PROFILE.entityType}
- Founded: ${PROH_PROFILE.foundedYear}; formally registered: ${PROH_PROFILE.registeredYear}
- ${PROH_PROFILE.executiveTitle}: ${PROH_PROFILE.executiveDirector}
- Location: ${PROH_PROFILE.location}
- Address: ${PROH_PROFILE.postalAddress}
- Email: ${PROH_PROFILE.email}
- Phone: ${PROH_PROFILE.phone}
- Website: ${PROH_PROFILE.website}

## Vision & mission
- Vision: ${PROH_PROFILE.vision}
- Mission: ${PROH_PROFILE.mission}
- Pillars: ${PROH_PILLARS.join('; ')}
- Program focus areas: ${PROH_FOCUS_AREAS.join('; ')}

## Impact (official figures)
- Children supported: ${PROH_IMPACT.childrenSupported}
- Youth skilled: ${PROH_IMPACT.youthSkilled} (${PROH_IMPACT.youthSkilledNote})
- Women in savings groups: ${PROH_IMPACT.womenInSavingsGroups}
- Trees planted: ${PROH_IMPACT.treesPlanted}

## HER Lab (in-person flagship)
- ${HER_LAB_PROGRAM.relationToProh}
- Duration: ${HER_LAB_PROGRAM.duration}
- Cost: ${HER_LAB_PROGRAM.cost}
- Who it serves: ${HER_LAB_PROGRAM.targetDemographics}
- Training locations: ${HER_LAB_PROGRAM.trainingLocations.join('; ')}
- ${HER_LAB_PROGRAM.digitalExtension}

### HER Lab curriculum
- Mandatory core: ${HER_LAB_MANDATORY_CORE.join('; ')}
- TVET majors: ${HER_LAB_MAJORS.join('; ')}
- Minors: ${HER_LAB_MINORS.join('; ')}

## Strategic partners (verified on official channels)
${VERIFIED_PARTNERS.map((p) => `- ${p}`).join('\n')}
${ADDITIONAL_PARTNERS_NOTE}

## HER Lab Academy (this e-learning portal)
- Public programs catalog: /courses (published courses only)
- Register with enrollment code: /register (format: 1–3 letter prefix + 5 digits)
- Portal program tracks (prefixes): ${getPortalProgramList()}
- Students: /dashboard — modules, progress, forum, complaints, profile, certificates
- Teachers: course content, students, announcements, quizzes, forum
- Admins: users, courses, notices, complaints, certificates, surveys
- Certificates: auto-issued at 100% course progress (PDF)
`.trim();
}

export function matchInstitutionFaq(message: string): string | null {
  const q = message.toLowerCase();
  for (const faq of INSTITUTION_FAQS) {
    if (faq.keywords.some((k) => q.includes(k))) {
      return faq.answer;
    }
  }
  return null;
}
