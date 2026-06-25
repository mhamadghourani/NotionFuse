'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notionService } from '@/services/NotionService';
import { 
  GitMerge, 
  RefreshCw, 
  Layers, 
  HelpCircle, 
  Database, 
  Type, 
  MapPin, 
  ChevronRight,
  History,
  AlertCircle
} from 'lucide-react';

// Dynamic Styling configurations based on your MergeHistoryEntity status codes
const STATUS_CONFIG = {
  PENDING: {
    text: 'Execution Pending',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
    icon: RefreshCw,
  },
  SUCCESS: {
    text: 'Verified Success',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    icon: CheckCircle,
  },
  FAILED: {
    text: 'Engine Failure',
    color: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    icon: AlertCircle,
  },
};

export default function MergeWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State Management
  const [databases, setDatabases] = useState([]);
  const [mergedHistory, setMergedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMerging, setIsMerging] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uiError, setUiError] = useState(null); 
  const [isManualParent, setIsManualParent] = useState(false); 

  // Form Parameters
  const [sourceDatabaseAId, setSourceDatabaseAId] = useState('');
  const [sourceDatabaseBId, setSourceDatabaseBId] = useState('');
  const [customMergedDatabaseName, setCustomMergedDatabaseName] = useState('');
  const [targetParentPageId, setTargetParentPageId] = useState('');

  // Safeguarded loader checking each internal pipeline separately to prevent lock freezes
  const loadWorkspaceData = async () => {
    setLoading(true);
    setUiError(null); 
    try {
      const [dbData, historyData] = await Promise.all([
        notionService.getDatabases().catch(err => {
          console.error("Failed to load databases:", err);
          return []; 
        }),
        notionService.getMergedHistory().catch(err => {
          console.error("Failed to load history logs:", err);
          return []; 
        })
      ]);
      
      setDatabases(dbData || []);
      setMergedHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error("Workspace fatal loading sequence error:", err);
      setUiError("Failed to establish context connection with backend data pipelines.");
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    loadWorkspaceData();
    if (searchParams.get('status') === 'success') {
      setNotification({ type: 'success', message: 'Engine pipeline executed successfully.' });
    }
  }, [searchParams]);

  const handleMergeSubmit = async (e) => {
    e.preventDefault();
    setUiError(null); 

    if (!sourceDatabaseAId || !sourceDatabaseBId || !customMergedDatabaseName) {
      setUiError("Missing required parameters. Please ensure sources and identity name are filled.");
      return;
    }
    if (sourceDatabaseAId === sourceDatabaseBId) {
      setUiError("Source databases must be distinct. You cannot merge a database into itself.");
      return;
    }

    const selectedDbA = databases.find(db => db.id === sourceDatabaseAId);
    let finalTargetId = isManualParent ? targetParentPageId : (selectedDbA?.parentId || "");

    if (!finalTargetId) {
      setUiError("Parent ID automatic resolution failed. Please switch layout mode to Manual Entry.");
      return;
    }

    setIsMerging(true);

    const sanitizeNotionId = (input) => {
      if (!input) return "";
      let sanitized = input.trim();
      if (sanitized.includes("notion.so")) {
        const matches = sanitized.split(/[/-]/);
        sanitized = matches[matches.length - 1].split('?')[0];
      }
      return sanitized.replace(/-/g, "");
    };

    const payload = {
      sourceDatabaseAId: sanitizeNotionId(sourceDatabaseAId),
      sourceDatabaseBId: sanitizeNotionId(sourceDatabaseBId),
      customMergedDatabaseName: customMergedDatabaseName.trim(),
      targetParentPageId: sanitizeNotionId(finalTargetId)
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/notion/merge`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (errorData && errorData.message) {
          if (payload.targetParentPageId === "123" || errorData.status === 500) {
            setUiError("The provided Target Parent ID is invalid. Please verify the copied workspace UUID structure.");
          } else {
            setUiError(errorData.message);
          }
        } else {
          setUiError("Merge pipeline failed due to a structural API constraint.");
        }
        await loadWorkspaceData(); // Refresh history log dynamically to show the registered FAILED status line
        return;
      }

      setSourceDatabaseAId('');
      setSourceDatabaseBId('');
      setCustomMergedDatabaseName('');
      setTargetParentPageId('');
      
      setNotification({ type: 'success', message: 'Merge successful!' });
      setTimeout(() => setNotification(null), 4000);
      await loadWorkspaceData();
      
    } catch (err) {
      setUiError(`Network connection lost: ${err.message}`);
    } finally {
      setIsMerging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E19] flex flex-col items-center justify-center gap-4 transition-colors duration-300">
        <RefreshCw className="animate-spin text-blue-500 w-8 h-8" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Booting Merge Matrix...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0B0E19] text-gray-900 dark:text-gray-100 p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Floating Notification */}
        {notification && (
          <div className="fixed top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4 p-4 rounded-2xl text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-lg flex items-center gap-3 backdrop-blur-xl">
            <CheckCircle className="w-5 h-5" />
            {notification.message}
          </div>
        )}

        {/* Header Section */}
        <header>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <GitMerge className="text-blue-500" size={28} />
            Merge Engine <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded uppercase tracking-tighter">v2.1</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Orchestrate structural database synchronization pipelines.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CONTROL PANEL (Sidebar) */}
          <aside className="lg:col-span-4 space-y-6 sticky top-8">
            <div className="bg-white dark:bg-[#15192D] rounded-3xl border border-gray-100 dark:border-gray-800/60 p-6 shadow-xl shadow-black/[0.02] transition-colors duration-300">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Layers size={12} /> Configuration
              </h2>

              <form onSubmit={handleMergeSubmit} className="space-y-6">
                
                {/* Source A */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                    <Database size={13} className="text-blue-500" /> Database Source A
                  </label>
                  <select
                    value={sourceDatabaseAId}
                    onChange={(e) => setSourceDatabaseAId(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0B0E19] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Database A</option>
                    {databases.map(db => <option key={db.id} value={db.id}>{db.emoji || '📁'} {db.title}</option>)}
                  </select>
                </div>

                {/* Source B */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                    <Database size={13} className="text-purple-500" /> Database Source B
                  </label>
                  <select
                    value={sourceDatabaseBId}
                    onChange={(e) => setSourceDatabaseBId(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0B0E19] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Database B</option>
                    {databases.map(db => <option key={db.id} value={db.id}>{db.emoji || '📁'} {db.title}</option>)}
                  </select>
                </div>

                {/* Output Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                    <Type size={13} /> Destination Identity
                  </label>
                  <input
                    type="text"
                    value={customMergedDatabaseName}
                    onChange={(e) => setCustomMergedDatabaseName(e.target.value)}
                    placeholder="e.g., Global Master CRM"
                    className="w-full bg-gray-50 dark:bg-[#0B0E19] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>

                {/* Target Location */}
                <div className="bg-gray-50 dark:bg-[#0B0E19]/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800/50 space-y-3">
                   <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                      <MapPin size={12} /> Target Page
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsManualParent(!isManualParent)}
                      className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                    >
                      {isManualParent ? "Auto-Detect" : "Manual"}
                    </button>
                  </div>
                  {isManualParent ? (
                    <input
                      type="text"
                      placeholder="Enter Notion Page ID..."
                      value={targetParentPageId}
                      onChange={(e) => setTargetParentPageId(e.target.value)}
                      className="w-full bg-white dark:bg-[#0B0E19] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-[11px] font-mono text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  ) : (
                    <p className="text-[11px] text-gray-500 dark:text-gray-500 italic">Inheriting hierarchy from Source A...</p>
                  )}
                </div>

                {/* INLINE UI ALERT CONTAINER BOX */}
                {uiError && (
                  <div className="p-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20 text-xs font-medium flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{uiError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isMerging}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                >
                  {isMerging ? <RefreshCw className="animate-spin w-4 h-4" /> : <ChevronRight size={16} />}
                  {isMerging ? 'Executing Pipeline...' : 'Run Merge Pipeline'}
                </button>
              </form>
            </div>
            
            {/* Help Block */}
            <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-500/10 flex gap-3 transition-colors duration-300">
              <HelpCircle className="text-blue-500 shrink-0" size={16} />
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Merging preserves original block IDs while creating a new synchronized structure in your Notion workspace.
              </p>
            </div>
          </aside>

          {/* AUDIT LOG / HISTORY */}
          <section className="lg:col-span-8 bg-white dark:bg-[#15192D] rounded-3xl border border-gray-100 dark:border-gray-800/60 overflow-hidden shadow-xl shadow-black/[0.02] transition-colors duration-300 min-h-[500px]">
            <header className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/60 flex justify-between items-center bg-gray-50/30 dark:bg-transparent">
              <div className="flex items-center gap-2">
                <History size={16} className="text-blue-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Execution History</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Engine Logs</span>
              </div>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#0F1221] text-gray-500 text-[10px] font-black uppercase tracking-widest transition-colors duration-300">
                    <th className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/60">Database Structure Name</th>
                    <th className="px-6 py-4 text-center border-b border-gray-100 dark:border-gray-800/60">Engine Status</th>
                    <th className="px-6 py-4 text-right border-b border-gray-100 dark:border-gray-800/60">Deployment Time</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100 dark:divide-gray-800">
                  {mergedHistory.length > 0 ? (
                    mergedHistory.map((item, idx) => {
                      // Resolve styling configuration profiles based on backend database state maps
                      const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.FAILED;
                      const StatusIcon = config.icon;

                      return (
                        <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-[#1D243C]/40 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 font-bold group-hover:scale-110 transition-transform">
                                {item.databaseName?.charAt(0) || 'U'}
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-gray-200">{item.databaseName || "Unified Notion Hub"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${config.color}`}>
                              <StatusIcon size={11} className={item.status === 'PENDING' ? 'animate-spin' : ''} />
                              {config.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500 font-medium">
                            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '0.0s ago'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-24 text-center">
                        <AlertCircle className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={36} />
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">No Execution History Found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

function CheckCircle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}