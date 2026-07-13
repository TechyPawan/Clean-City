import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  // Define dimensions based on size presets
  const sizeClasses = {
    sm: {
      box: 'w-9 h-9',
      icon: 'w-4 h-4',
      textMain: 'text-sm',
      textSub: 'text-[9px]',
      gap: 'gap-2'
    },
    md: {
      box: 'w-10 h-10',
      icon: 'w-5 h-5',
      textMain: 'text-base',
      textSub: 'text-[10px]',
      gap: 'gap-3'
    },
    lg: {
      box: 'w-14 h-14',
      icon: 'w-7 h-7',
      textMain: 'text-xl',
      textSub: 'text-xs',
      gap: 'gap-4'
    },
    xl: {
      box: 'w-20 h-20',
      icon: 'w-10 h-10',
      textMain: 'text-2xl',
      textSub: 'text-sm',
      gap: 'gap-5'
    }
  }[size];

  return (
    <div className={`flex items-center ${sizeClasses.gap} ${className}`}>
      {/* Impressive Custom 3D-glowing Civic Leaf & Sparkle Vector Logo */}
      <div className="relative group">
        {/* Dynamic rotating outer halo aura */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-400 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
        
        {/* Animated outer spinning futuristic tech ring */}
        <div className="absolute -inset-1 border border-emerald-500/30 rounded-xl animate-[spin_8s_linear_infinite] pointer-events-none"></div>
        
        {/* Main emblem container */}
        <div className={`relative ${sizeClasses.box} bg-slate-950 border border-emerald-400/50 rounded-xl flex items-center justify-center overflow-hidden shadow-[inset_0_0_12px_rgba(52,211,153,0.2)]`}>
          {/* Subtle tech background grids in the logo */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:4px_4px]"></div>
          
          <svg
            className="w-[85%] h-[85%] text-emerald-400 filter drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer stylized bio-mechanical gear petals */}
            <path
              d="M50 8C58.3 8 66 11.4 71.6 17L72 17.4C77.4 23 80.8 30.7 80.8 39C80.8 54 68.8 66 53.8 66H46.2C31.2 66 19.2 54 19.2 39C19.2 30.7 22.6 23 28 17.4L28.4 17C34 11.4 41.7 8 50 8Z"
              stroke="url(#emblem-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="4 2"
              className="animate-[spin_20s_linear_infinite]"
              transform-origin="50 37"
            />
            {/* Center geometric pristine prism leaf veins */}
            <path
              d="M50 16 L50 56 M50 24 L68 34 M50 34 L32 44 M50 40 L64 48 M50 48 L36 54"
              stroke="url(#emblem-grad-teal)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
            {/* Sparkle starburst right on top representing pristine clean environment */}
            <circle cx="50" cy="56" r="3" fill="#34d399" className="animate-ping" />
            
            <defs>
              <linearGradient id="emblem-grad" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="emblem-grad-teal" x1="50" y1="16" x2="50" y2="56">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Glowing central sparkle overlays */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Sparkles className={`${sizeClasses.icon} text-cyan-300 animate-pulse`} />
          </div>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`${sizeClasses.textMain} font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 block uppercase`}>
            Clean City
          </span>
          <span className={`${sizeClasses.textSub} text-emerald-400/80 font-mono block tracking-[0.2em] uppercase font-bold`}>
            Municipal OS <span className="text-slate-500 opacity-60 ml-0.5 font-sans">v4.0</span>
          </span>
        </div>
      )}
    </div>
  );
}
