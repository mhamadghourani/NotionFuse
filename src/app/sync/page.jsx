'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notionService } from '@/services/NotionService';
import { RefreshCw, Activity, Zap, Play, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SyncDashboardPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [syncingRows, setSyncingRows] = useState({});

  const loadPipelines = async () => {
    setLoading(true);
    try {
      const pipelineData = await notionService.getActivePipelines();
      setPipelines(Array.isArray(pipelineData) ? pipelineData : []);
      setError(null);
    } catch (err) {
      console.error("Failed to load sync execution pipelines:", err);
      setError(err.message || "FAILED_LOAD");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipelines();
  }, []);

  const handleManualSync = async (pipelineId) => {
    setSyncingRows((prev) => ({ ...prev, [pipelineId]: true }));
    setNotification(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/notion/sync/${pipelineId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Synchronization pipeline returned an unexpected failure state.');
      }

      setNotification({ 
        type: 'success', 
        message: `Database synchronization successfully completed!` 
      });

      await loadPipelines();

    } catch (err) {
      console.error("Manual sync dispatch failed:", err);
      setNotification({ 
        type: 'error', 
        message: `Sync Error: ${err.message}` 
      });
    } finally {
      setSyncingRows((prev) => ({ ...prev, [pipelineId]: false }));
    }
  };

  return (
    <main className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-6xl mx-auto min-h-screen bg-gray-50 dark:bg-[#0B0E19] font-sans antialiased text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Alert Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl text-sm font-semibold border shadow-sm transition-all duration-300 flex items-center gap-3 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Header Panel */}
      <section className="bg-white dark:bg-[#15192D] p-6 md:p-8 rounded-3xl shadow-xl shadow-black/[0.02] border border-gray-100 dark:border-gray-800/60 w-full transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <Activity className="text-blue-500" size={24} />
              Active Sync Pipelines
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Trigger manual incremental sync updates across your integrated Notion workspaces.</p>
          </div>
          <button 
            onClick={loadPipelines}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-[#0B0E19] border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-500" : ""} />
            {loading ? 'Refreshing...' : 'Refresh Connections'}
          </button>
        </div>
      </section>

      {/* Main Dashboard Section */}
      <section className="bg-white dark:bg-[#15192D] rounded-3xl shadow-xl shadow-black/[0.02] border border-gray-100 dark:border-gray-800/60 w-full overflow-hidden transition-colors">
        {loading && pipelines.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="animate-spin w-6 h-6 text-blue-500" />
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">
              Parsing dynamic pipeline configurations...
            </div>
          </div>
        ) : (pipelines.length === 0 || error) ? (
          /* Universal Pipeline Onboarding Empty State */
          <div className="p-16 flex flex-col items-center justify-center min-h-[350px] max-w-md mx-auto text-center">
            <div className="w-14 h-14 bg-gray-50 dark:bg-[#0B0E19] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-5">
              <Database size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              No Active Sync Pipelines
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              There is no structural data mapped to this layout yet. Try creating a new database merge operation to display tracking entries here.
            </p>
            <div className="mt-8">
              <button 
                onClick={() => router.push('/merge')}
                className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                Create Database Merge Layout →
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-[#0F1221] border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="px-8 py-5">Merged Target Database Name</th>
                  <th className="px-6 py-5 text-center">Status Matrix</th>
                  <th className="px-6 py-5 text-center">Automation Profile</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/80 text-sm">
                {pipelines.map((item) => {
                  const isSyncing = !!syncingRows[item.id];
                  // Safe extraction check regardless of Spring/Jackson serialization setups
                  const isAutomationActive = item.automationActive ?? item.isAutomationActive;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1D243C]/30 transition-colors">
                      <td className="px-8 py-5 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">✨</span>
                          <span className="leading-tight">{item.databaseName || "Unified Notion Database"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isSyncing 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse'
                            : item.status === 'PAUSED' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}>
                          {isSyncing ? 'SYNCING...' : (item.status || "ACTIVE")}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        {isAutomationActive ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            <Zap size={12} className="fill-emerald-500/20" /> Auto-Sync Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 border border-transparent dark:border-gray-800 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            Manual Only
                          </span>
                        )}
                      </td>

                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => handleManualSync(item.id)}
                          disabled={isSyncing}
                          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.97] ${
                            isSyncing
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 border border-blue-600/20 dark:border-blue-500/20'
                          }`}
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <Play size={12} className="fill-current" />
                              Sync Now
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}