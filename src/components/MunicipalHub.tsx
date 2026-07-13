import React from 'react';
import { Campaign } from '../types';
import { Calendar, Users, Award, MapPin, CheckCircle, Info, FileText, Landmark, Handshake } from 'lucide-react';

interface MunicipalHubProps {
  campaigns: Campaign[];
  onJoinCampaign: (id: string) => void;
  currentUserPoints: number;
}

// Mock Leaderboard for top-performing local clean-up champions
const LEADERBOARD = [
  { name: 'Marcus Sterling', sector: 'Downtown West', points: 1450, rank: 1 },
  { name: 'Sophia Lin', sector: 'Suburban North', points: 1200, rank: 2 },
  { name: 'Evelyn Foster', sector: 'University District', points: 980, rank: 3 },
  { name: 'Dave Miller', sector: 'Industrial East', points: 850, rank: 4 },
  { name: 'Karan Sharma', sector: 'Riverside South', points: 720, rank: 5 },
];

export default function MunicipalHub({ campaigns, onJoinCampaign, currentUserPoints }: MunicipalHubProps) {
  return (
    <div id="municipal-hub-panel" className="space-y-10">
      {/* Government Partnership Banner */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-neon-emerald">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold">
            <Landmark className="w-4 h-4" />
            Federal Sanitation Alliance
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Municipal Cooperation & Policy Hub
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Coordinated by the municipal administration and regional development ministries. We provide safety equipment, insurance coverage, and official civic certificates for volunteer activities and continuous recycling performance.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <span className="inline-flex items-center gap-1 text-slate-300 text-xs bg-slate-950/80 px-2.5 py-1 rounded-md border border-emerald-500/10">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> State-Certified Hours
            </span>
            <span className="inline-flex items-center gap-1 text-slate-300 text-xs bg-slate-950/80 px-2.5 py-1 rounded-md border border-emerald-500/10">
              <Award className="w-3.5 h-3.5 text-teal-400" /> Green Reward Credits
            </span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/20 p-5 rounded-xl flex flex-col items-center justify-center min-w-[180px] text-center shadow-neon-emerald">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Your Balance</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">{currentUserPoints} GP</p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Green Points Available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Campaign List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 tracking-tight">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Active Environmental Campaigns
            </h3>
            <span className="text-xs text-slate-400 font-mono tracking-wider">3 Campaigns Available</span>
          </div>

          <div className="space-y-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 hover:border-emerald-500/30 hover:shadow-neon-emerald p-5 rounded-2xl transition-all duration-300 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                <div className="space-y-3 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        camp.status === 'Active'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : camp.status === 'Completed'
                          ? 'bg-slate-850 text-slate-400 border border-slate-700'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {camp.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Organizer: {camp.organizer}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-200">{camp.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{camp.description}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {camp.date} ({camp.time})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" /> {camp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {camp.volunteersCount} / {camp.maxVolunteers} Joined
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto shrink-0 border-t border-emerald-500/10 md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">REWARD GP</span>
                    <span className="text-emerald-400 font-extrabold text-lg font-mono">+{camp.pointsReward} GP</span>
                  </div>

                  {camp.joined ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-slate-850 text-slate-400 border border-emerald-500/10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 w-full md:w-auto"
                    >
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-400" /> Joined Event
                    </button>
                  ) : camp.volunteersCount >= camp.maxVolunteers ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-slate-850 text-slate-500 rounded-lg text-xs font-semibold w-full md:w-auto"
                    >
                      Capacity Full
                    </button>
                  ) : (
                    <button
                      onClick={() => onJoinCampaign(camp.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold uppercase tracking-wider transition-all w-full md:w-auto cursor-pointer shadow-neon-emerald-btn"
                    >
                      Volunteer Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Educational Guidelines */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              Municipal Recycling & Sorting Standard Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
                  <h4 className="text-sm font-semibold text-slate-100">Organic & Bio-Degradables</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Wet waste, food remains, horticultural composts, paper cardboard. Collected every Tuesday/Friday. Must use biodegradable green bags.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></span>
                  <h4 className="text-sm font-semibold text-slate-100">Plastics & Mixed Dry Recyclables</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pet bottles, metal cans, clean milk cartons, dry paperboard. Collected every Monday/Thursday. Place inside blue bins.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_#f87171]"></span>
                  <h4 className="text-sm font-semibold text-slate-100">Hazardous Domestic Chemicals</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Aerosols, unused medical bottles, cleaning reagents, paint boxes. Requires scheduling custom collection or safe drop-off at Tech Park Zone.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_#c084fc]"></span>
                  <h4 className="text-sm font-semibold text-slate-100">Electronic E-Waste Standard</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Damaged smartphones, dry alkaline battery cells, obsolete chargers, processors. Handled via specialized collection at University Science Box.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard and Information Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Civic Champions Leaderboard */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-5 rounded-2xl space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5 text-emerald-400" />
                Citizen Green Champions
              </h3>
              <p className="text-[11px] text-slate-500">Top contributors making the city cleaner this month</p>
            </div>

            <div className="space-y-3">
              {LEADERBOARD.map((item) => (
                <div
                  key={item.rank}
                  className="bg-slate-950/80 border border-emerald-500/5 p-3 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        item.rank === 1
                          ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                          : item.rank === 2
                          ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30'
                          : item.rank === 3
                          ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{item.name}</h4>
                      <p className="text-[9px] text-slate-500 font-mono">{item.sector}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">{item.points} GP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Impacts / Circular Economy */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/20 p-5 rounded-2xl space-y-4 shadow-neon-emerald">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Handshake className="w-4 h-4 text-emerald-400" />
              Circular Economy Program
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every upvoted report you log helps dispatchers route clean-up fleets efficiently. Attending campaigns boosts city health parameters and grants credits. These credits can be used to waive utility municipal recycling fees or converted into local eco-friendly retailer discounts!
            </p>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-500/10 text-[11px] text-slate-400 space-y-1 font-mono">
              <p>🌱 <span className="font-semibold text-slate-300">100 GP</span> = Free compost bucket</p>
              <p>🚌 <span className="font-semibold text-slate-300">250 GP</span> = 1 Month City Transit Pass</p>
              <p>⚡ <span className="font-semibold text-slate-300">500 GP</span> = 15% Waste Utility waiver</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
