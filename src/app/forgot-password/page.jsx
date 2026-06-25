'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { authService } from '@/services/NotionService';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const data = await authService.forgotPassword(email);
      setMessage(data.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Could not send reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans text-gray-900 antialiased transition-colors duration-300 dark:bg-[#0B0E19] dark:text-gray-100">
      <div className="w-full max-w-md rounded-[32px] border border-gray-100 bg-white p-8 shadow-2xl shadow-black/[0.03] transition-colors dark:border-gray-800/60 dark:bg-[#15192D] md:p-10">
        <button type="button" onClick={() => router.push('/login')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
          <ArrowLeft size={16} />
          Back to login
        </button>

        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-500">
            <Mail size={24} />
          </div>
          <h1 className="text-center text-2xl font-black tracking-tight text-gray-900 dark:text-white">Reset Password</h1>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">Enter your email and we will send a reset link.</p>
        </div>

        {message && <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</div>}
        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <Mail size={18} />
            </div>
            <input value={email} type="email" placeholder="Email Address" required className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-[#0B0E19] dark:text-gray-100" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <button type="submit" disabled={submitting} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? 'Sending...' : 'Send Reset Link'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
