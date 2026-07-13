import React from 'react';
import { Truck, ShieldCheck, HeartHandshake, Map, ArrowRight, UserCheck, Star, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingHeroProps {
  onNavigate: (tab: 'map' | 'hub' | 'portal' | 'complaint') => void;
  cityCleanlinessIndex: number;
}

export default function LandingHero({ onNavigate, cityCleanlinessIndex }: LandingHeroProps) {
  return (
    <div id="landing-hero-container" className="space-y-16">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Official Government Municipal Partnership
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Keeping Cities Clean Through <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Smart Technology</span>
          </h1>

          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Clean City connects citizens with municipal administrative teams and state departments. Track real-time collections, manage IoT smart bins, report hazards, and build a cleaner, greener circular economy.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <button
              onClick={() => onNavigate('map')}
              className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer group"
            >
              Explore 3D Tracker
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate('complaint')}
              className="px-5 py-3.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
            >
              Register Complaint / Wastage
              <AlertTriangle className="w-4 h-4 text-slate-950" />
            </button>
            <button
              onClick={() => onNavigate('portal')}
              className="px-5 py-3.5 bg-slate-900/60 hover:bg-slate-800 text-slate-100 border border-emerald-500/20 hover:border-emerald-400/40 font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-neon-emerald"
            >
              Access Portal
              <UserCheck className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-8 pt-4 border-t border-emerald-500/10">
            <div>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">{cityCleanlinessIndex}%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Cleanliness Index</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-teal-400 font-mono tracking-tight">1.2M</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Citizens Served</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">99.8%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">SLA Dispatch rate</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Block */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl blur-3xl opacity-30"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Visual Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/10 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span className="font-mono text-xs text-slate-400 uppercase tracking-widest font-semibold">MAIN_CONTROL_HQ</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest">STATUS: OPTIMAL</span>
            </div>

            {/* Wireframe City Layout Representation */}
            <div className="h-64 bg-slate-950 rounded-xl border border-emerald-500/10 flex items-center justify-center overflow-hidden relative eco-grid-bg">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:16px_16px] opacity-20"></div>

              {/* Fake Isometric representation */}
              <div className="transform rotate-x-[55deg] rotate-z-[45deg] scale-125 flex flex-col gap-3 relative">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 animate-bounce">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="w-12 h-24 bg-slate-800/80 border border-slate-700/60 rounded flex items-end p-2 text-slate-500 text-[9px] font-mono">HQ</div>
                  <div className="w-12 h-12 bg-slate-800/80 border border-slate-700/60 rounded"></div>
                </div>
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-slate-800/80 border border-slate-700/60 rounded"></div>
                  <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/30 rounded flex items-center justify-center text-teal-400">
                    <Map className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="w-12 h-16 bg-slate-800/80 border border-slate-700/60 rounded"></div>
                </div>
              </div>

              {/* Floating Dashboard Indicators */}
              <div className="absolute top-4 right-4 bg-slate-900/95 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-2xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px] text-slate-350 font-mono tracking-wider">UNIT #1 ACTIVE</span>
              </div>

              <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-2xl">
                <span className="text-rose-400 text-xs font-bold font-mono">92%</span>
                <span className="text-[10px] text-slate-350 font-mono tracking-wider">BIN ALERT</span>
              </div>
            </div>

            {/* Quick overview metrics below map */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-950/80 border border-emerald-500/20 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Waste Diverted</span>
                <span className="text-slate-100 text-lg font-mono font-bold">14,280 <span className="text-xs text-emerald-400">TONS</span></span>
              </div>
              <div className="bg-slate-950/80 border border-emerald-500/20 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Recycling Efficiency</span>
                <span className="text-emerald-400 text-lg font-mono font-bold">78.4% <span className="text-xs">RATE</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate/Municipal Partners Logo Row */}
      <div className="border-t border-b border-slate-800/80 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-slate-400 font-semibold tracking-wider uppercase text-center md:text-left">
          Endorsed and Co-ordinated by
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-80">
          <div className="flex items-center gap-2 text-slate-300 font-bold font-mono tracking-tighter text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            DEPT. OF URBAN SANITATION
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-bold font-mono tracking-tighter text-sm">
            <HeartHandshake className="w-5 h-5 text-teal-400" />
            STATE ECO-POLLUTION BOARD
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-bold font-mono tracking-tighter text-sm">
            <Users className="w-5 h-5 text-emerald-400" />
            MUNICIPAL DEVELOPMENT CO.
          </div>
        </div>
      </div>

      {/* Core Features Overview */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-100">Smart Waste Ecosystem Modules</h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            Our platform operates across four primary channels to guarantee clean, safe public spaces through direct civic collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-6 rounded-2xl hover:border-emerald-500/40 hover:shadow-neon-emerald transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-center text-emerald-400">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Real-Time Tracking & IoT</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Watch trash collection trucks drive through virtual streets in real-time. IoT fill meters report trash accumulation instantaneously, alerting crews prior to overflow.
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mt-6 hover:text-emerald-300 transition-colors cursor-pointer group"
            >
              Open 3D Tracker Map
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-6 rounded-2xl hover:border-emerald-500/40 hover:shadow-neon-emerald transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Public Incidents Hub</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empower citizens to instantly log waste concerns with photographs, category descriptions, urgency tags, and precise locations. Upvote other reports to mark community urgency.
              </p>
            </div>
            <button
              onClick={() => onNavigate('complaint')}
              className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mt-6 hover:text-emerald-300 transition-colors cursor-pointer group"
            >
              Log Citizen Report
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-6 rounded-2xl hover:border-emerald-500/40 hover:shadow-neon-emerald transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-center text-emerald-400">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Municipal Partnerships</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Participate in state-funded cleaning campaigns, eco-awareness weeks, and plastic drives. Earn sustainable certification and green rewards points from governmental agencies.
              </p>
            </div>
            <button
              onClick={() => onNavigate('hub')}
              className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mt-6 hover:text-emerald-300 transition-colors cursor-pointer group"
            >
              View Campaign Board
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
