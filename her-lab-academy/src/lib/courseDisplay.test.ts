import { describe, it, expect } from 'vitest';
import { categoryColor, formatDuration, mapCourseRow, slugifyCourseTitle } from './courseDisplay';

describe('courseDisplay', () => {
  it('formats duration from weeks', () => {
    expect(formatDuration(10)).toBe('10 weeks');
    expect(formatDuration(1)).toBe('1 week');
    expect(formatDuration(null)).toBe('Flexible');
  });

  it('maps course row', () => {
    const row = mapCourseRow({
      id: 'abc',
      title: 'Plumbing',
      description: 'Test',
      category: 'Trades',
      cover_emoji: 'PL',
      cover_image_url: null,
      duration_weeks: 10,
    });
    expect(row.title).toBe('Plumbing');
    expect(row.slug).toBe('plumbing');
    expect(row.icon).toBe('PL');
    expect(row.category).toBe('Trades');
  });

  it('slugifies course titles for public links', () => {
    expect(slugifyCourseTitle('Solar PV Installation')).toBe('solar-pv-installation');
    expect(slugifyCourseTitle('Health & Safety Basics')).toBe('health-and-safety-basics');
  });

  it('returns fallback category color', () => {
    expect(categoryColor('Unknown')).toContain('gray');
  });
});
