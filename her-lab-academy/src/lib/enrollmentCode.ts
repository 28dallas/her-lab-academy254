import { getPrefixForCourseTitle } from './courseEnrollmentPrefixes';

/** Build enrollment code: PREFIX + 5 random digits */
export function generateEnrollmentCode(courseTitle: string): string {
  const prefix = getPrefixForCourseTitle(courseTitle) ?? 'HL';
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${suffix}`;
}
