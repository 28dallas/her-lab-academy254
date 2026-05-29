import { getPrefixForCourseTitle } from './courseEnrollmentPrefixes';

/** Build enrollment code: PREFIX + 6 random digits */
export function generateEnrollmentCode(courseTitle: string): string {
  const prefix = getPrefixForCourseTitle(courseTitle) ?? 'HL';
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${suffix}`;
}
