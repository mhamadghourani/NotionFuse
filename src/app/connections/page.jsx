'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { notionService } from '@/services/NotionService';
import { Plug, RefreshCw, Plus, ExternalLink, ArrowRight } from 'lucide-react';

export default function ConnectionsPage() {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotConnected, setIsNotConnected] = useState(false);
  const [notification, setNotification] = useState(null);

  const searchParams = useSearchParams();

  const fetchDatabases = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      setDatabases([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await notionService.getDatabases();

      setDatabases(Array.isArray(data) ? data : []);
      setIsNotConnected(false);
    } catch (err) {
      const message = err?.message || '';

      if (
        message.includes('401') ||
        message.includes('403') ||
        message.toLowerCase().includes('unauthorized')
      ) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return;
      }

      // 🔥 Added explicit checks for "failed to fetch databases" string permutations
      if (
        message.toLowerCase().includes('not connected') || 
        message.toLowerCase().includes('notion is not connected') ||
        message.toLowerCase().includes('no credentials found') ||
        message.toLowerCase().includes('failed to fetch databases') ||
        message.toLowerCase().includes('failed to fetch')
      ) {
        setIsNotConnected(true);
        setDatabases([]);
      } else {
        setError(message || 'Failed to retrieve workspace metrics.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      fetchDatabases();
    } else {
      setLoading(false);
    }

    const status = searchParams.get('status');

    if (status === 'success') {
      setNotification({
        type: 'success',
        message: 'Notion integration successfully linked!'
      });
    }

    if (status === 'error') {
      setNotification({
        type: 'error',
        message: 'Failed to link integration.'
      });
    }
  }, [searchParams]);

  const handleAddIntegration = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      const response = await notionService.getConnectUrl();
      
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("Invalid redirection structure received from server side resource context map.");
      }
    } catch (err) {
      console.error("Redirection pipeline handshake setup aborted:", err);
      setError("Failed to initialize a secure synchronization connection context with Notion. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0B0E19] p-8 md:p-12 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">

        {notification && (
          <div
            className={`p-4 rounded-2xl font-medium border text-sm shadow-sm ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Global errors show up here ONLY if it's an unexpected network crash */}
        {error && (
          <div className="p-4 rounded-2xl font-medium border text-sm shadow-sm bg-rose-500/10 text-rose-400 border-rose-500/20">
            {error}
          </div>
        )}

        <section className="bg-white dark:bg-[#15192D] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Connections
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage and sync your global Notion database integrations.
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={fetchDatabases}
                disabled={loading}
                className="flex-1 sm:flex-initial px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#0B0E19] rounded-xl hover:bg-gray-200 dark:hover:bg-[#1D243C] transition-all flex items-center justify-center min-w-[120px]"
              >
                {loading ? (
                  <RefreshCw className="animate-spin w-4 h-4" />
                ) : (
                  'Refresh Data'
                )}
              </button>

              <button
                onClick={handleAddIntegration}
                disabled={loading}
                className="flex-1 sm:flex-initial bg-blue-600 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Add Integration
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-[#15192D] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {loading && databases.length === 0 ? (
            <div className="p-20 text-center text-sm text-gray-400 animate-pulse">
              Syncing your workspace data...
            </div>
          ) : (isNotConnected || databases.length === 0) ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
                <Plug size={32} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No active connections
              </h3>

              <p className="text-sm text-gray-400 max-w-sm mt-2 mb-8">
                Connect your Notion workspace to begin syncing your data across your layout frames.
              </p>

              <button
                onClick={handleAddIntegration}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                Connect Notion Workspace
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-[#0F1221] text-[10px] uppercase text-gray-400 font-bold">
                  <tr>
                    <th className="px-8 py-5">Database Name</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {databases.map((db) => (
                    <tr
                      key={db.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#1D243C]/30 transition-colors group"
                    >
                      <td className="px-8 py-6 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="text-xl">
                            {db.emoji || '📁'}
                          </span>
                          {db.title}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-6 items-center">
                          <a
                            href={db.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-500 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors"
                          >
                            Open
                            <ExternalLink size={12} />
                          </a>

                          {/* <button
                            onClick={() =>
                              (window.location.href = `/automations/new?source=${db.id}`)
                            }
                            className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded-lg text-[11px] font-bold uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                          >
                            Merge
                            <ArrowRight size={12} />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}