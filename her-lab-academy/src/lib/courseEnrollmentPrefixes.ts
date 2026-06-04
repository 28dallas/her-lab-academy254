export const COURSE_ENROLLMENT_PREFIXES: Record<string, string> = {
  // Enrollment codes format: PREFIX + 5 digits (PREFIX = 1-3 uppercase letters)
  "Electrical Installation": "EL",
  "Solar PV Installation": "SP",
  "Plumbing": "PL",
  "Cosmetology": "CT",
  "Fashion Design": "FD",
  "Regenerative Agriculture": "RA",
  "Core Agriculture": "CA",
  "Reproductive Health": "RH",
  "ICT": "IT",
  "Basic Digital Literacy": "DL",
  "Entrepreneurship": "EP",
  "Beadwork": "BW",
};


export const COURSE_PREFIXES_SET = new Set(
  Object.values(COURSE_ENROLLMENT_PREFIXES)
);

export function getPrefixForCourseTitle(title: string) {
  return COURSE_ENROLLMENT_PREFIXES[title] ?? null;
}

