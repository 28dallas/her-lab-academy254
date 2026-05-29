'use client';

import React, { useState } from 'react';
import { Users, UserCheck } from 'lucide-react';
import { AvatarFallback } from '@/components/ui/AvatarFallback';
import { updateUserRole } from '@/app/actions/admin';

export interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsersClient({ users: initialUsers }: { users: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, role: string) => {
    setError('');
    const fd = new FormData();
    fd.set('userId', userId);
    fd.set('role', role);
    const result = await updateUserRole(fd);
    if (result.error) {
      setError(result.error);
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <Users className="w-8 h-8 text-[var(--color-primary)]" /> Manage Users
        </h1>
        <p className="text-gray-600 mt-1">View users and assign roles (student, teacher, admin).</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-center gap-3">
                  <AvatarFallback name={u.full_name ?? u.email ?? 'User'} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900">{u.full_name ?? '—'}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm capitalize"
                >
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
