'use client';

import React, { useState } from 'react';
import { AvatarFallback } from '@/components/ui/AvatarFallback';
import { createClient } from '@/utils/supabase/client';
import { User, Save, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  // Mock profile values removed. Load from Supabase until fully wired.
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwError(error.message); return; }
    setNewPw('');
    setConfirmPw('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <User className="w-8 h-8 text-[var(--color-primary)]" /> My Profile
        </h1>
        <p className="text-gray-600 mt-2">Update your personal information and password.</p>
      </div>

      {/* Avatar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center gap-6">
        <AvatarFallback name={fullName} size="lg" />
        <div>
          <p className="font-semibold text-gray-900">{fullName}</p>
          <p className="text-sm text-gray-500">student@example.com</p>
          <p className="text-xs text-gray-400 mt-1">Avatar uses your initials — no photo needed.</p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-900">Personal Information</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#cf5626] transition-colors">
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordUpdate} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-gray-500" /> Change Password
        </h2>
        {pwError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{pwError}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type={showPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            placeholder="Repeat new password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            {pwSaved
              ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Updated!</>
              : <><KeyRound className="w-4 h-4" /> Update Password</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
