import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Copy, Check, RefreshCw, Layers, ShieldCheck, HelpCircle } from 'lucide-react';
import { SQL_SETUP_SCRIPT, verifySupabaseConnection, seedSupabaseDatabase } from '../supabaseService';

interface SupabaseStatusPanelProps {
  status: {
    isConnected: boolean;
    missingTables: string[];
    isFetching: boolean;
    error: string | null;
  };
  onRefresh: () => void;
}

export default function SupabaseStatusPanel({ status, onRefresh }: SupabaseStatusPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedSuccess(false);
    try {
      await seedSupabaseDatabase();
      setSeedSuccess(true);
      onRefresh();
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const allTablesOk = status.isConnected && status.missingTables.length === 0;

  return (
    <div id="supabase-status-widget" className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-5 shadow-neon-emerald backdrop-blur-md max-w-sm w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className={`w-5 h-5 ${allTablesOk ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">Supabase Cloud Sync</span>
        </div>
        
        <button
          type="button"
          onClick={onRefresh}
          disabled={status.isFetching}
          className="p-1.5 rounded-lg bg-slate-950/80 border border-emerald-500/10 text-emerald-400 hover:text-emerald-300 disabled:opacity-50 cursor-pointer hover:bg-slate-950 transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status.isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Status Badge */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5 text-left">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">CONNECTION METRIC</span>
          <span className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5">
            {status.isFetching ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                Verifying Sync...
              </>
            ) : allTablesOk ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
                Live Connected
              </>
            ) : status.isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Tables Missing
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Offline Fallback
              </>
            )}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">PROJECT ID</span>
          <span className="text-[11px] font-mono font-bold text-emerald-400 select-all">phptqjwvgxskvqtahyxm</span>
        </div>
      </div>

      {/* Table Status Matrix */}
      <div className="space-y-2 text-left">
        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">DATABASE SCHEMA INVENTORY</span>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          {[
            { name: 'reports', label: 'Incidents/Reports' },
            { name: 'bins', label: 'IoT Smart Bins' },
            { name: 'trucks', label: 'Fleet Trucks' },
            { name: 'campaigns', label: 'Civic Campaigns' },
            { name: 'users', label: 'Civic Point Profiles' },
          ].map((t) => {
            const isMissing = status.missingTables.includes(t.name);
            const exists = status.isConnected && !isMissing;
            return (
              <div 
                key={t.name}
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  exists 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <span>{t.label}</span>
                {exists ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnostics / Advice */}
      {!allTablesOk && (
        <div className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl space-y-2 text-left leading-relaxed">
          <div className="flex gap-1.5 items-center text-[10px] font-extrabold text-amber-400 uppercase font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Setup Action Required</span>
          </div>
          <p className="text-[10px] text-slate-300">
            To link your live database, open your <span className="text-emerald-400 font-semibold font-mono">Supabase Dashboard</span>, select the <span className="font-semibold text-slate-200">SQL Editor</span> tab, paste the schema script, and run it!
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="flex-grow py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer text-center transition-colors shadow-sm"
            >
              Get SQL Setup Script
            </button>
          </div>
        </div>
      )}

      {allTablesOk && (
        <div className="bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-xl space-y-2 text-left leading-relaxed">
          <div className="flex gap-1.5 items-center text-[10px] font-extrabold text-emerald-400 uppercase font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Synchronized Storage Active</span>
          </div>
          <p className="text-[10px] text-slate-300">
            All tables are linked successfully! Data mutations are written in real-time to your Supabase cloud tables.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSeedData}
              disabled={isSeeding}
              className="w-full py-1.5 px-2 bg-slate-950 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer text-center transition-colors disabled:opacity-50"
            >
              {isSeeding ? 'Seeding...' : seedSuccess ? 'Database Seeded! ✅' : 'Pre-Populate / Re-Seed Tables'}
            </button>
          </div>
        </div>
      )}

      {/* SQL Script overlay modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-neon-emerald flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-slate-950 p-4 border-b border-emerald-500/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-xs tracking-wider uppercase font-mono text-slate-100">Supabase SQL Schema Blueprint</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-grow text-left text-xs">
              <p className="text-slate-300">
                Execute the SQL below in your <span className="text-emerald-400 font-bold font-mono">Supabase SQL Editor</span> to create all required database tables and enable open Row Level Security policies for civic testing:
              </p>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
                  title="Copy SQL code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="bg-slate-950 text-emerald-400/90 font-mono text-[10px] p-4 rounded-xl border border-emerald-500/10 overflow-x-auto max-h-[350px] leading-relaxed whitespace-pre select-all">
                  {SQL_SETUP_SCRIPT}
                </pre>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl space-y-1.5">
                <h4 className="text-[11px] font-extrabold text-emerald-400 uppercase font-mono">👉 NEXT STEP AFTER RUNNING SCRIPT:</h4>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Once tables are created, click the <span className="font-bold text-emerald-400">"Pre-Populate / Re-Seed Tables"</span> button inside the widget to insert the core cities, smart bins, and campaigns into your database!
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 p-4 border-t border-slate-850 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
