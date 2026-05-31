import { describe, it, expect } from 'vitest';
import { categoryColor, formatDuration, mapCourseRow } from './courseDisplay';

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
      cover_emoji: '🔧',
      duration_weeks: 10,
    });
    expect(row.title).toBe('Plumbing');
    expect(row.icon).toBe('🔧');
    expect(row.category).toBe('Trades');
  });

  it('returns fallback category color', () => {
    expect(categoryColor('Unknown')).toContain('gray');
  });
});
