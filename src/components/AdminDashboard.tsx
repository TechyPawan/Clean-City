import React, { useState } from 'react';
import { SmartBin, Truck, Report } from '../types';
import { ShieldAlert, Trash2, Truck as TruckIcon, AlertTriangle, CheckCircle, BarChart3, Radio, RefreshCw, ChevronRight, User, Image as ImageIcon, Building } from 'lucide-react';

interface AdminDashboardProps {
  bins: SmartBin[];
  trucks: Truck[];
  reports: Report[];
  onEmptyBin: (binId: string) => void;
  onDispatchTruck: (truckId: string, reportId: string) => void;
  onResolveReportDirectly: (reportId: string) => void;
}

export default function AdminDashboard({
  bins,
  trucks,
  reports,
  onEmptyBin,
  onDispatchTruck,
  onResolveReportDirectly,
}: AdminDashboardProps) {
  const [selectedReportForDispatch, setSelectedReportForDispatch] = useState<Report | null>(null);
  const [dispatchFilter, setDispatchFilter] = useState<'all' | 'pending' | 'dispatched' | 'resolved'>('all');

  // Filter reported incidents based on tab selection
  const filteredReports = reports.filter((rep) => {
    if (dispatchFilter === 'pending') return rep.status === 'Pending';
    if (dispatchFilter === 'dispatched') return rep.status === 'Dispatched';
    if (dispatchFilter === 'resolved') return rep.status === 'Resolved';
    return true;
  });

  const criticalBins = bins.filter((b) => b.fillLevel >= 80);
  const pendingReports = reports.filter((r) => r.status === 'Pending');

  return (
    <div id="admin-dashboard-container" className="space-y-8 animate-fadeIn">
      {/* Overview Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between shadow-neon-emerald hover:border-emerald-500/45 transition-colors">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pending Hotspots</span>
            <p className="text-3xl font-extrabold text-slate-100 font-mono">{pendingReports.length}</p>
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest block">Fleet Assignment Req</span>
          </div>
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between shadow-neon-emerald hover:border-emerald-500/45 transition-colors">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Critical IoT Bins</span>
            <p className="text-3xl font-extrabold text-amber-500 font-mono">{criticalBins.length}</p>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Above 80% limit</span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between shadow-neon-emerald hover:border-emerald-500/45 transition-colors">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Active Fleet Vehicles</span>
            <p className="text-3xl font-extrabold text-emerald-400 font-mono">
              {trucks.filter((t) => t.status !== 'Idle').length} <span className="text-slate-500 text-lg">/ {trucks.length}</span>
            </p>
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest block">GPS units live</span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <TruckIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between shadow-neon-emerald hover:border-emerald-500/45 transition-colors">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Cleanliness Score</span>
            <p className="text-3xl font-extrabold text-teal-400 font-mono">92.5%</p>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Top regional band</span>
          </div>
          <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.25)]">
            <Radio className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Middle block: dispatch terminal */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 tracking-tight">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Incidents Dispatch & Verification Desk
            </h3>

            {/* Filter segments */}
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-emerald-500/10 self-start">
              <button
                onClick={() => setDispatchFilter('all')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  dispatchFilter === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDispatchFilter('pending')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  dispatchFilter === 'pending'
                    ? 'bg-rose-500 text-slate-950 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setDispatchFilter('dispatched')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  dispatchFilter === 'dispatched'
                    ? 'bg-blue-500 text-slate-950 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dispatched
              </button>
              <button
                onClick={() => setDispatchFilter('resolved')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  dispatchFilter === 'resolved'
                    ? 'bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* List of reports */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-slate-900/40 border border-emerald-500/10 p-8 rounded-2xl text-center text-slate-500 text-xs">
                No reports found matching selection criteria.
              </div>
            ) : (
              filteredReports.map((rep) => (
                <div
                  key={rep.id}
                  className={`bg-slate-900/40 backdrop-blur-sm border p-5 rounded-2xl space-y-4 transition-all duration-300 ${
                    selectedReportForDispatch?.id === rep.id
                      ? 'border-emerald-500 bg-slate-900/80 shadow-neon-emerald'
                      : 'border-emerald-500/10 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            rep.urgency === 'Critical' || rep.urgency === 'High'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {rep.urgency} Urgency
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {rep.id}</span>
                        <span className="text-slate-400 text-xs">· Category: <strong className="text-slate-300 font-bold">{rep.category}</strong></span>
                      </div>
                      <h4 className="text-base font-bold text-slate-100">{rep.title}</h4>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        rep.status === 'Resolved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : rep.status === 'Dispatched'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-950 text-slate-400 border border-emerald-500/10'
                      }`}
                    >
                      ● {rep.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed">{rep.description}</p>

                  {rep.photoUrl && (
                    <div className="mt-2.5 max-w-sm rounded-xl overflow-hidden border border-emerald-500/20 shadow-md relative group">
                      <img src={rep.photoUrl} alt={rep.title} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Image Logged
                      </div>
                    </div>
                  )}

                  {rep.assignedOrg && (
                    <div className="mt-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-400" />
                      Routed Department: <strong className="text-slate-200 font-bold">{rep.assignedOrg}</strong>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-emerald-500/5">
                    <span>📍 Coords: ({rep.location.x}, {rep.location.y}) - {rep.location.address}</span>
                    <span>Reporter: {rep.reporterName} ({rep.reporterEmail})</span>
                    <span>Upvotes: {rep.upvotes} Citizens</span>
                  </div>

                  {/* Actions area */}
                  <div className="flex flex-wrap gap-2 pt-2 justify-end">
                    {rep.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => setSelectedReportForDispatch(rep)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-emerald-500/15 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <TruckIcon className="w-3.5 h-3.5 text-emerald-400" />
                          Assign Collection Fleet
                        </button>
                        <button
                          onClick={() => onResolveReportDirectly(rep.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-neon-emerald-btn"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Direct Resolve
                        </button>
                      </>
                    )}

                    {rep.status === 'Dispatched' && (
                      <div className="text-xs text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                        Dispatched fleet is navigating coordinates.
                      </div>
                    )}

                    {rep.status === 'Resolved' && (
                      <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Site cleared. Civic feedback validated.
                      </div>
                    )}
                  </div>

                  {/* Fleet Selector Sub-panel */}
                  {selectedReportForDispatch?.id === rep.id && (
                    <div className="bg-slate-950/95 p-4 rounded-xl border border-emerald-500/30 mt-4 space-y-3 animate-fadeIn shadow-neon-emerald">
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                        Available Fleets for Dispatch
                      </h5>
                      <p className="text-[11px] text-slate-450">
                        Select an active collection vehicle to dispatch to coordinate ({rep.location.x}, {rep.location.y})
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {trucks.map((truck) => {
                          const isIdle = truck.status === 'Idle';
                          return (
                            <button
                              key={truck.id}
                              disabled={!isIdle}
                              onClick={() => {
                                onDispatchTruck(truck.id, rep.id);
                                setSelectedReportForDispatch(null);
                              }}
                              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                                isIdle
                                  ? 'bg-slate-900 border-emerald-500/10 hover:border-emerald-500/40 hover:bg-slate-850 cursor-pointer'
                                  : 'bg-slate-950 border-transparent opacity-40 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-xs font-bold text-slate-200">{truck.plateNumber}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    isIdle ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-850 text-slate-500'
                                  }`}
                                >
                                  {truck.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-2 space-y-0.5 font-mono">
                                <p>Driver: <strong className="text-slate-300 font-bold">{truck.driverName}</strong></p>
                                <p>Load Capacity: <span className="text-slate-300">{truck.fillLevel}%</span></p>
                              </div>
                              {isIdle && (
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-3 flex items-center gap-0.5 self-end">
                                  Dispatch Truck <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: IoT container capacity alerts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-5 rounded-2xl space-y-5 shadow-neon-emerald">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 tracking-tight">
                <Radio className="w-4.5 h-4.5 text-emerald-400" />
                IoT Smart Bin Capacity Monitor
              </h3>
              <p className="text-[11px] text-slate-400">Direct telemetry feeds from all regional smart receptacles</p>
            </div>

            <div className="space-y-3.5">
              {bins.map((bin) => {
                const isCritical = bin.fillLevel >= 80;
                return (
                  <div
                    key={bin.id}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all duration-300 ${
                      isCritical
                        ? 'bg-red-500/5 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                        : 'bg-slate-950/80 border-emerald-500/10'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200 truncate max-w-[140px]">{bin.name}</span>
                      <span
                        className={`font-mono font-bold ${
                          isCritical ? 'text-red-400 animate-pulse' : bin.fillLevel >= 50 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {bin.fillLevel}% Full
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          isCritical ? 'bg-red-500' : bin.fillLevel >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${bin.fillLevel}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>Type: {bin.type}</span>
                      {isCritical ? (
                        <button
                          onClick={() => onEmptyBin(bin.id)}
                          className="px-2 py-0.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-slate-950 border border-red-500/30 rounded font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Empty Bin
                        </button>
                      ) : (
                        <button
                          onClick={() => onEmptyBin(bin.id)}
                          className="text-slate-450 hover:text-emerald-400 underline transition-colors cursor-pointer"
                        >
                          Manual Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
