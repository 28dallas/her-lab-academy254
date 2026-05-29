import { redirect } from 'next/navigation';

export default function AdminAnalyticsPlaceholder() {
  // Keep static label if needed; analytics should be DB-backed later.
  // For now, avoid any mock numeric/stat content.
  redirect('/admin');
}

