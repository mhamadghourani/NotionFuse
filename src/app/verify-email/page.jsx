'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { authService } from '@/services/NotionService';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const hasVerified = useRef(false);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      if (hasVerified.current) {
        return;
      }

      hasVerified.current = true;

      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const data = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(data.message || 'Email verified successfully.');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Could not verify email.');
      }
    };

    verify();
  }, [token]);

  const Icon = status === 'loading' ? Loader2 : status === 'success' ? CheckCircle2 : XCircle;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans text-gray-900 antialiased transition-colors duration-300 dark:bg-[#0B0E19] dark:text-gray-100">
      <div className="w-full max-w-md rounded-[32px] border border-gray-100 bg-white p-8 text-center shadow-2xl shadow-black/[0.03] transition-colors dark:border-gray-800/60 dark:bg-[#15192D] md:p-10">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${status === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : status === 'error' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-500'}`}>
          <Icon size={28} className={status === 'loading' ? 'animate-spin' : ''} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Email Verification</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{message}</p>

        <button type="button" onClick={() => router.push('/login')} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98]">
          Go to Login
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
