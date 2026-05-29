export const COURSE_ENROLLMENT_PREFIXES: Record<string, string> = {
  // Enrollment codes format enforced in register: PREFIX + 5 digits
  // PREFIX is 1-3 uppercase letters.
  "Electrical Installation": "EI",
  "Solar PV Installation": "SP",
  "Plumbing": "P",
  "Cosmetology": "C",
  "Fashion Design": "FD",
  "Regenerative Agriculture": "RA",
  "Core Agriculture": "CA",
  "Reproductive Health": "RH",
  "ICT": "ICT",
  "Basic Digital Literacy": "DL",
  "Entrepreneurship": "E",
  "Beadwork": "B",
};


export const COURSE_PREFIXES_SET = new Set(
  Object.values(COURSE_ENROLLMENT_PREFIXES)
);

export function getPrefixForCourseTitle(title: string) {
  return COURSE_ENROLLMENT_PREFIXES[title] ?? null;
}

