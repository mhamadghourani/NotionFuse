'use client';
import React, { useState, useEffect } from 'react';
import { userService } from '@/services/NotionService';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState({ profile: false, password: false });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getMe();
        setProfile(data);
      } catch (err) {
        setError("Could not load user data. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(prev => ({ ...prev, profile: true }));
    try {
      await userService.updateProfile({ name: profile.name });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setIsSaving(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(prev => ({ ...prev, password: true }));
    try {
      await userService.updatePassword(passwords);
      alert('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      alert(err.message || 'Failed to update password.');
    } finally {
      setIsSaving(prev => ({ ...prev, password: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account identity and security.</p>
      </div>

      <div className="space-y-12">
        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <button disabled={isSaving.profile} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-80 transition-opacity">
              {isSaving.profile ? 'Saving...' : 'Update Name'}
            </button>
          </form>
        </section>

        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Security</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="password" placeholder="Current Password" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 rounded-xl outline-none" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
              <input type="password" placeholder="New Password" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 rounded-xl outline-none" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
            </div>
            <button disabled={isSaving.password} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {isSaving.password ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        <div className="flex justify-between items-center p-6 border border-red-100 dark:border-red-900/30 rounded-2xl bg-red-50/50 dark:bg-red-900/10">
          <div>
            <h4 className="font-semibold text-red-700 dark:text-red-400">Sign out</h4>
            <p className="text-sm text-red-600/70">End your session on this device.</p>
          </div>
          <button onClick={handleLogout} className="px-5 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-white transition-all">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}