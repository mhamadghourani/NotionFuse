'use client';

import { useState, useEffect } from 'react';
import { Database, GitMerge, Zap, CreditCard, ChevronDown } from 'lucide-react';
import { userService, notionService } from '@/services/NotionService';

export default function DashboardPage() {
  const [data, setData] = useState({
    user: null,
    pipelines: [],
    history: [],
    loading: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all dashboard data in parallel for speed
        const [user, pipelines, history] = await Promise.all([
          userService.getMe().catch(() => null),
          notionService.getActivePipelines().catch(() => []),
          notionService.getMergedHistory().catch(() => [])
        ]);

        setData({ user, pipelines, history, loading: false });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setData(prev => ({ ...prev, loading: false }));
      }
    }
    fetchData();
  }, []);

  if (data.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0E19] text-gray-400">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0B0E19] p-6 md:p-12 font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter">Hello, {data.user?.name ? data.user.name.charAt(0).toUpperCase() + data.user.name.slice(1) : 'Developer'} 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Your command center for real-time data orchestration.</p>
          </div>
          <div className="bg-white dark:bg-[#15192D] px-8 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Plan</p>
              <p className="text-2xl font-black text-blue-600">{data.user?.plan || 'N/A'}</p>
            </div>
            <Zap className="text-amber-400 w-8 h-8" />
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Active Pipelines" value={data.pipelines.length.toString()} icon={<Database />} color="emerald" />
          <StatCard label="Total Merges" value={data.history.length.toString()} icon={<GitMerge />} color="blue" />
          <StatCard label="Credits" value="∞" icon={<Zap />} color="amber" />
          <StatCard label="Tier" value={data.user?.plan || 'N/A'} icon={<CreditCard />} color="purple" />
        </section>

        {/* Data Table */}
        <section className="bg-white dark:bg-[#15192D] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
            <h2 className="font-bold text-xl">Recent Merge History</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-[#0F1221] text-[11px] uppercase text-gray-400 font-bold">
              <tr>
                <th className="px-8 py-4">Database Name</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
              {data.history.length > 0 ? data.history.map((item) => (
                <MergeRow key={item.id} title={item.databaseName} status={item.status} date={item.createdAt} />
              )) : (
                <tr><td colSpan="3" className="px-8 py-10 text-center text-gray-400">No recent activity found.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

// --- Helper Components ---

function StatCard({ label, value, icon, color }) {
  const styles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const glowColors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#15192D] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:scale-[1.02]">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
          <p className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl border ${styles[color]}`}>
          {icon}
        </div>
      </div>
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-20 ${glowColors[color]}`} />
    </div>
  );
}

function MergeRow({ title, status, date }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-[#1D243C] transition-colors">
      <td className="px-8 py-5 font-bold">{title}</td>
      <td className="px-8 py-5">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${status === 'SUCCESS' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700'}`}>
          {status}
        </span>
      </td>
      <td className="px-8 py-5 text-right text-gray-400 text-xs font-medium">
        {date !== 'UNKNOWN' ? new Date(date).toLocaleDateString() : 'N/A'}
      </td>
    </tr>
  );
}