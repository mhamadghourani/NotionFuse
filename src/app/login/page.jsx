'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, LogIn, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/NotionService';

const passwordChecks = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const isStrongPassword = (password) => passwordChecks.every((check) => check.test(password));

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();


useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  authService
    .validateToken()
    .then(() => {
      router.push("/dashboard");
    })
    .catch(() => {
      localStorage.removeItem("token");
    });
}, [router]);
 const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');
  setError('');
  if (!isLogin && !isStrongPassword(formData.password)) {
    setError('Password must be at least 8 characters and include one uppercase letter and one special character.');
    return;
  }

  setSubmitting(true);

  try {
    if (isLogin) {
      const data = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
      return;
    }

    const data = await authService.register(formData);
    setMessage(data.message || 'Account created. Check your email to verify your account.');
    setIsLogin(true);

  } catch (error) {
    console.error('Auth Error:', error);
    setError(error.message || 'Could not connect to server.');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0B0E19] p-4 font-sans antialiased text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="w-full max-w-md p-8 md:p-10 bg-white dark:bg-[#15192D] rounded-[32px] shadow-2xl shadow-black/[0.03] border border-gray-100 dark:border-gray-800/60 transition-colors">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-500">
            {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h1 className="text-2xl font-black text-center tracking-tight text-gray-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            {isLogin ? 'Enter your details to access your workspace.' : 'Sign up to start syncing your databases.'}
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input type="text" placeholder="Full Name" required className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0B0E19] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input type="email" placeholder="Email Address" required className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0B0E19] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input type="password" placeholder="Password" required minLength={isLogin ? undefined : 8} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0B0E19] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          {!isLogin && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-[#0B0E19] dark:text-gray-400">
              {passwordChecks.map((check) => {
                const passed = check.test(formData.password);
                return (
                  <div key={check.label} className={`flex items-center gap-2 py-1 ${passed ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    <CheckCircle2 size={14} />
                    {check.label}
                  </div>
                );
              })}
            </div>
          )}
          {isLogin && (
            <button type="button" onClick={() => router.push('/forgot-password')} className="self-end text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Forgot password?
            </button>
          )}

          <button type="submit" disabled={submitting} className="mt-2 w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="ml-1.5 text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all">
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}
