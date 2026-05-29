import { redirect } from 'next/navigation';
import { Users, Search, Plus, UserCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { AvatarFallback } from '@/components/ui/AvatarFallback';


export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  // DB-backed users not implemented here; avoid mock rows.
  // Keep UI structure with empty state.
  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
            <Users className="w-8 h-8 text-[var(--color-primary)]" /> Manage Users
          </h1>
          <p className="text-gray-600 mt-1">Add teachers, manage roles, and view all platform users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Search className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600">Search is disabled until users are loaded from the database.</p>
          </div>
          <div className="text-center py-16">
            <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users to display.</p>
          </div>
        </div>
      </div>

      {/* Static quick note (no mock data) */}
      <div className="text-sm text-gray-500">
        Note: Admin user management UI is currently DB-disabled to avoid showing placeholder rows.
      </div>
    </div>
  );
}

