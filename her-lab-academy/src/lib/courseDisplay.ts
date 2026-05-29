export type PublicCourse = {
  id: string;
  title: string;
  category: string;
  icon: string;
  duration: string;
  color: string;
  description: string | null;
  coverImageUrl: string | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  Trades: 'bg-yellow-50 text-yellow-600',
  Vocational: 'bg-pink-50 text-pink-600',
  Agriculture: 'bg-green-50 text-green-600',
  Health: 'bg-red-50 text-red-500',
  Technology: 'bg-blue-50 text-blue-600',
  Business: 'bg-amber-50 text-amber-600',
};

export function categoryColor(category: string | null): string {
  return CATEGORY_COLORS[category ?? ''] ?? 'bg-gray-50 text-gray-600';
}

export function formatDuration(weeks: number | null): string {
  if (!weeks) return 'Flexible';
  return `${weeks} week${weeks === 1 ? '' : 's'}`;
}

export function mapCourseRow(row: {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_emoji: string | null;
  cover_image_url: string | null;
  duration_weeks: number | null;
}): PublicCourse {
  const category = row.category ?? 'General';
  return {
    id: row.id,
    title: row.title,
    category,
    icon: row.cover_emoji ?? '📚',
    duration: formatDuration(row.duration_weeks),
    color: categoryColor(category),
    description: row.description,
    coverImageUrl: row.cover_image_url,
  };
}

export const COURSE_CATEGORY_TABS = [
  'All',
  'Trades',
  'Vocational',
  'Agriculture',
  'Technology',
  'Health',
  'Business',
] as const;
