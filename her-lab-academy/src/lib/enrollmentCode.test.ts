import { describe, it, expect } from 'vitest';
import { generateEnrollmentCode } from './enrollmentCode';
import { getPrefixForCourseTitle } from './courseEnrollmentPrefixes';

describe('enrollmentCode', () => {
  it('generates code with known prefix', () => {
    const code = generateEnrollmentCode('Plumbing');
    expect(code.startsWith('P')).toBe(true);
    expect(code.length).toBeGreaterThan(3);
  });

  it('maps course titles to prefixes', () => {
    expect(getPrefixForCourseTitle('ICT')).toBe('ICT');
    expect(getPrefixForCourseTitle('Soap Making')).toBe('SM');
  });
});
