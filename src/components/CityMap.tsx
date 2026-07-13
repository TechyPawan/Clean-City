import React, { useState, useMemo } from 'react';
import { SmartBin, Truck, Report } from '../types';
import { Truck as TruckIcon, Trash2, AlertTriangle, RotateCw, RefreshCw, ZoomIn, ZoomOut, Info, MapPin } from 'lucide-react';

interface CityMapProps {
  bins: SmartBin[];
  trucks: Truck[];
  reports: Report[];
  onSelectBin?: (bin: SmartBin) => void;
  onSelectTruck?: (truck: Truck) => void;
  onSelectReport?: (report: Report) => void;
  highlightedId?: string | null;
}

// 3D Isometric building placements { x, y, width, length, height, name, color }
const CITY_BUILDINGS = [
  { x: 10, y: 80, w: 12, l: 12, h: 40, name: 'Eco-Housing Complex A', color: 'rgba(52, 211, 153, 0.15)' },
  { x: 80, y: 15, w: 14, l: 14, h: 65, name: 'Global Tech HQ', color: 'rgba(59, 130, 246, 0.15)' },
  { x: 45, y: 45, w: 16, l: 16, h: 50, name: 'Municipal City Hall', color: 'rgba(239, 68, 68, 0.15)' },
  { x: 15, y: 20, w: 10, l: 10, h: 30, name: 'Downtown Shopping Center', color: 'rgba(245, 158, 11, 0.15)' },
  { x: 82, y: 82, w: 14, l: 14, h: 35, name: 'Clean-Energy Facility', color: 'rgba(16, 185, 129, 0.15)' },
  { x: 75, y: 50, w: 10, l: 10, h: 45, name: 'University Science Block', color: 'rgba(139, 92, 246, 0.15)' },
];

export default function CityMap({
  bins,
  trucks,
  reports,
  onSelectBin,
  onSelectTruck,
  onSelectReport,
  highlightedId,
}: CityMapProps) {
  const [tilt, setTilt] = useState<number>(0.6); // isometric tilt factor
  const [angle, setAngle] = useState<number>(30); // rotation offset angle in degrees
  const [scale, setScale] = useState<number>(4.2); // zoom scale
  const [filter, setFilter] = useState<'all' | 'bins' | 'trucks' | 'reports'>('all');
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'bin' | 'truck' | 'report' | 'building';
    data: any;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Projection logic: projects flat 2D (0-100) coordinate space into 3D isometric space
  const project = (x: number, y: number, z: number = 0) => {
    // Center around (50, 50)
    const cx = x - 50;
    const cy = y - 50;

    // Apply rotation angle (convert to radians)
    const rad = (angle * Math.PI) / 180;
    const rx = cx * Math.cos(rad) - cy * Math.sin(rad);
    const ry = cx * Math.sin(rad) + cy * Math.cos(rad);

    // Apply isometric tilt
    const isoX = (rx - ry) * Math.cos(Math.PI / 6) * scale;
    const isoY = (rx + ry) * Math.sin(Math.PI / 6) * scale * tilt - z * scale * tilt * 0.8;

    return {
      x: isoX + 350, // shift to center of viewport
      y: isoY + 230,
    };
  };

  // Generate isometric polygon paths for buildings
  const getBuildingFaces = (b: typeof CITY_BUILDINGS[0]) => {
    const pBase0 = project(b.x, b.y, 0);
    const pBase1 = project(b.x + b.w, b.y, 0);
    const pBase2 = project(b.x + b.w, b.y + b.l, 0);
    const pBase3 = project(b.x, b.y + b.l, 0);

    const pTop0 = project(b.x, b.y, b.h);
    const pTop1 = project(b.x + b.w, b.y, b.h);
    const pTop2 = project(b.x + b.w, b.y + b.l, b.h);
    const pTop3 = project(b.x, b.y + b.l, b.h);

    return {
      bottom: `${pBase0.x},${pBase0.y} ${pBase1.x},${pBase1.y} ${pBase2.x},${pBase2.y} ${pBase3.x},${pBase3.y}`,
      left: `${pBase0.x},${pBase0.y} ${pBase3.x},${pBase3.y} ${pTop3.x},${pTop3.y} ${pTop0.x},${pTop0.y}`,
      right: `${pBase3.x},${pBase3.y} ${pBase2.x},${pBase2.y} ${pTop2.x},${pTop2.y} ${pTop3.x},${pTop3.y}`,
      top: `${pTop0.x},${pTop0.y} ${pTop1.x},${pTop1.y} ${pTop2.x},${pTop2.y} ${pTop3.x},${pTop3.y}`,
    };
  };

  const mapGridLines = useMemo(() => {
    const lines = [];
    // Draw horizontal grid lines
    for (let i = 0; i <= 100; i += 20) {
      const pStart = project(0, i, 0);
      const pEnd = project(100, i, 0);
      lines.push({ x1: pStart.x, y1: pStart.y, x2: pEnd.x, y2: pEnd.y });
    }
    // Draw vertical grid lines
    for (let i = 0; i <= 100; i += 20) {
      const pStart = project(i, 0, 0);
      const pEnd = project(i, 100, 0);
      lines.push({ x1: pStart.x, y1: pStart.y, x2: pEnd.x, y2: pEnd.y });
    }
    return lines;
  }, [tilt, angle, scale]);

  // Roads: custom lines to represent major urban grid connectivity
  const roads = [
    { from: { x: 50, y: 0 }, to: { x: 50, y: 100 } }, // Main Central Avenue
    { from: { x: 0, y: 50 }, to: { x: 100, y: 50 } }, // Civic Boulevard
    { from: { x: 25, y: 0 }, to: { x: 25, y: 100 } }, // West Transit Ring
    { from: { x: 75, y: 0 }, to: { x: 75, y: 100 } }, // East Tech Boulevard
  ];

  return (
    <div id="city-map-container" className="relative w-full h-[540px] bg-slate-950 rounded-2xl border border-emerald-500/20 shadow-neon-emerald overflow-hidden group eco-grid-bg">
      {/* Dynamic Futuristic Map Header */}
      <div id="map-control-bar" className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 px-3.5 py-2 rounded-xl flex items-center gap-2 pointer-events-auto shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></div>
          <span className="font-mono text-xs text-emerald-300 font-bold tracking-widest uppercase">Telemetry Stream: v4.0</span>
        </div>

        <div className="flex gap-1 bg-slate-900/95 backdrop-blur-md border border-emerald-500/10 p-1 rounded-xl pointer-events-auto shadow-2xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              filter === 'all' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            All Sectors
          </button>
          <button
            onClick={() => setFilter('bins')}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              filter === 'bins' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Smart Bins
          </button>
          <button
            onClick={() => setFilter('trucks')}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              filter === 'trucks' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Fleets
          </button>
          <button
            onClick={() => setFilter('reports')}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              filter === 'reports' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Hotspots
          </button>
        </div>
      </div>

      {/* Control Dials on the right side */}
      <div id="map-view-dials" className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-slate-900/95 backdrop-blur-md border border-emerald-500/20 p-2 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setAngle((prev) => (prev + 15) % 360)}
          title="Rotate View"
          className="p-2.5 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg transition-all duration-200 border border-emerald-500/10 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTilt((prev) => Math.min(Math.max(prev + 0.1, 0.4), 0.9))}
          title="Tilt Up"
          className="p-2.5 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg transition-all duration-200 border border-emerald-500/10 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 rotate-45" />
        </button>
        <button
          onClick={() => setTilt((prev) => Math.max(Math.min(prev - 0.1, 0.9), 0.4))}
          title="Tilt Down"
          className="p-2.5 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg transition-all duration-200 border border-emerald-500/10 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 -rotate-45" />
        </button>
        <div className="w-full h-px bg-slate-800/80 my-1"></div>
        <button
          onClick={() => setScale((prev) => Math.min(prev + 0.5, 8))}
          title="Zoom In"
          className="p-2.5 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg transition-all duration-200 border border-emerald-500/10 cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale((prev) => Math.max(prev - 0.5, 2.5))}
          title="Zoom Out"
          className="p-2.5 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg transition-all duration-200 border border-emerald-500/10 cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Primary SVG Isometric Map Grid */}
      <svg
        id="isometric-map-svg"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ perspective: '800px' }}
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Outer Glow of Map Area */}
        <circle cx="350" cy="230" r="300" fill="url(#mapGlow)" />

        {/* Grid Lines */}
        <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,4">
          {mapGridLines.map((line, idx) => (
            <line key={idx} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
          ))}
        </g>

        {/* Roads/streets representation (Isometric Grid paths) */}
        <g stroke="#334155" strokeWidth="6" strokeLinecap="round" opacity="0.6">
          {roads.map((road, idx) => {
            const pFrom = project(road.from.x, road.from.y);
            const pTo = project(road.to.x, road.to.y);
            return (
              <line
                key={idx}
                x1={pFrom.x}
                y1={pFrom.y}
                x2={pTo.x}
                y2={pTo.y}
                className="transition-all duration-300"
              />
            );
          })}
        </g>

        {/* Active Route Trails for Trucks */}
        {filter !== 'bins' && filter !== 'reports' && trucks.map((truck) => {
          if (truck.route.length < 2) return null;
          return (
            <g key={`trail-${truck.id}`} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.4" fill="none">
              {truck.route.map((node, idx) => {
                if (idx === 0) return null;
                const prevNode = truck.route[idx - 1];
                const pPrev = project(prevNode.x, prevNode.y);
                const pCurr = project(node.x, node.y);
                return (
                  <line
                    key={idx}
                    x1={pPrev.x}
                    y1={pPrev.y}
                    x2={pCurr.x}
                    y2={pCurr.y}
                  />
                );
              })}
            </g>
          );
        })}

        {/* City Blocks/Skyscrapers in 3D */}
        <g id="isometric-buildings">
          {CITY_BUILDINGS.map((b, idx) => {
            const faces = getBuildingFaces(b);
            const centerPrj = project(b.x + b.w / 2, b.y + b.l / 2, b.h / 2);
            return (
              <g
                key={idx}
                className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                onMouseEnter={(e) => {
                  setHoveredItem({
                    type: 'building',
                    data: b,
                    screenX: centerPrj.x,
                    screenY: centerPrj.y - 40,
                  });
                }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Bottom flat shape */}
                <polygon points={faces.bottom} fill="rgba(15, 23, 42, 0.6)" />
                {/* Left side panel */}
                <polygon
                  points={faces.left}
                  fill="rgba(30, 41, 59, 0.7)"
                  stroke="rgba(16, 185, 129, 0.1)"
                  strokeWidth="0.5"
                />
                {/* Right side panel */}
                <polygon
                  points={faces.right}
                  fill="rgba(15, 23, 42, 0.85)"
                  stroke="rgba(16, 185, 129, 0.1)"
                  strokeWidth="0.5"
                />
                {/* Roof top panel */}
                <polygon
                  points={faces.top}
                  fill={b.color}
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth="0.7"
                />
                {/* Edge neon wireframe lines */}
                <polyline
                  points={`${project(b.x, b.y, b.h).x},${project(b.x, b.y, b.h).y} ${project(b.x + b.w, b.y, b.h).x},${project(b.x + b.w, b.y, b.h).y} ${project(b.x + b.w, b.y + b.l, b.h).x},${project(b.x + b.w, b.y + b.l, b.h).y}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="0.7"
                  opacity="0.3"
                />
              </g>
            );
          })}
        </g>

        {/* SMART BINS - IoT Nodes */}
        {(filter === 'all' || filter === 'bins') && bins.map((bin) => {
          const basePrj = project(bin.location.x, bin.location.y, 0);
          const heightFactor = bin.fillLevel * 0.18; // vertical representation of load in 3D
          const fillPrj = project(bin.location.x, bin.location.y, heightFactor);

          const isHigh = bin.fillLevel >= 80;
          const isMedium = bin.fillLevel >= 50 && bin.fillLevel < 80;
          const binColor = isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981';
          const binGlow = isHigh ? 'rgba(239, 68, 68, 0.4)' : isMedium ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)';

          const isHighlighted = highlightedId === bin.id;

          return (
            <g
              key={bin.id}
              className="cursor-pointer transition-transform duration-200 hover:scale-110"
              onClick={() => onSelectBin && onSelectBin(bin)}
              onMouseEnter={() => {
                setHoveredItem({
                  type: 'bin',
                  data: bin,
                  screenX: basePrj.x,
                  screenY: fillPrj.y - 15,
                });
              }}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Pulsing Floor Ring */}
              <circle
                cx={basePrj.x}
                cy={basePrj.y}
                r={isHighlighted ? 14 : 9}
                fill="none"
                stroke={binColor}
                strokeWidth="1.5"
                opacity={isHigh ? 0.7 : 0.4}
                className={isHigh || isHighlighted ? 'animate-ping' : ''}
                style={{ transformOrigin: `${basePrj.x}px ${basePrj.y}px` }}
              />

              {/* Base Platform */}
              <ellipse cx={basePrj.x} cy={basePrj.y} rx="5" ry="3" fill="#1e293b" stroke="#64748b" strokeWidth="0.5" />

              {/* IoT Dynamic Vertical Bar showing Fill Capacity */}
              <line
                x1={basePrj.x}
                y1={basePrj.y}
                x2={basePrj.x}
                y2={fillPrj.y}
                stroke={binColor}
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Top Sensor Dot */}
              <circle
                cx={basePrj.x}
                cy={fillPrj.y}
                r={isHighlighted ? 4 : 3}
                fill={binColor}
                stroke="#ffffff"
                strokeWidth="0.7"
              />
            </g>
          );
        })}

        {/* CITIZENS HOTSPOT REPORTS */}
        {(filter === 'all' || filter === 'reports') && reports.map((rep) => {
          if (rep.status === 'Resolved') return null;
          const prj = project(rep.location.x, rep.location.y, 10);
          const isCritical = rep.urgency === 'Critical' || rep.urgency === 'High';
          const isDispatched = rep.status === 'Dispatched';
          const indicatorColor = isDispatched ? '#3b82f6' : isCritical ? '#ef4444' : '#f59e0b';
          const isHighlighted = highlightedId === rep.id;

          return (
            <g
              key={rep.id}
              className="cursor-pointer"
              onClick={() => onSelectReport && onSelectReport(rep)}
              onMouseEnter={() => {
                setHoveredItem({
                  type: 'report',
                  data: rep,
                  screenX: prj.x,
                  screenY: prj.y - 15,
                });
              }}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Hotspot Outer Beacon */}
              <circle
                cx={prj.x}
                cy={prj.y}
                r={isHighlighted ? 22 : 15}
                fill="none"
                stroke={indicatorColor}
                strokeWidth="1.5"
                className="animate-pulse"
                opacity="0.6"
              />

              {/* Shadow Base */}
              <ellipse cx={prj.x} cy={prj.y + 10} rx="4" ry="2" fill="rgba(0,0,0,0.4)" />

              {/* Dynamic Flagpole */}
              <line x1={prj.x} y1={prj.y + 10} x2={prj.x} y2={prj.y - 12} stroke="#cbd5e1" strokeWidth="1" />

              {/* Flag / Hazard Emblem */}
              <path
                d={`M ${prj.x} ${prj.y - 12} L ${prj.x + 12} ${prj.y - 7} L ${prj.x} ${prj.y - 2} Z`}
                fill={indicatorColor}
                stroke="#ffffff"
                strokeWidth="0.5"
              />

              {/* Interactive Pulsing alert point */}
              <circle cx={prj.x} cy={prj.y - 12} r="2" fill="#ffffff" />
            </g>
          );
        })}

        {/* TRUCKS - Real-time Fleets */}
        {(filter === 'all' || filter === 'trucks') && trucks.map((truck) => {
          const prj = project(truck.location.x, truck.location.y, 6);
          const isHighlighted = highlightedId === truck.id;

          return (
            <g
              key={truck.id}
              className="cursor-pointer transition-transform duration-300"
              onClick={() => onSelectTruck && onSelectTruck(truck)}
              onMouseEnter={() => {
                setHoveredItem({
                  type: 'truck',
                  data: truck,
                  screenX: prj.x,
                  screenY: prj.y - 15,
                });
              }}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Dynamic Beacon ring based on status */}
              <circle
                cx={prj.x}
                cy={prj.y}
                r={isHighlighted ? 18 : 12}
                fill="none"
                stroke={truck.status === 'Collecting' ? '#fbbf24' : '#10b981'}
                strokeWidth="1.5"
                opacity="0.7"
                className={truck.status === 'Collecting' ? 'animate-spin' : ''}
                style={{ transformOrigin: `${prj.x}px ${prj.y}px`, strokeDasharray: '4,4' }}
              />

              {/* Ground Shadow */}
              <ellipse cx={prj.x} cy={prj.y + 6} rx="7" ry="3.5" fill="rgba(0, 0, 0, 0.4)" />

              {/* 3D Truck cab isometric representation */}
              <g transform={`translate(${prj.x - 7}, ${prj.y - 8})`}>
                {/* Truck Cargo Body */}
                <rect
                  x="0"
                  y="0"
                  width="10"
                  height="7"
                  rx="1"
                  fill={truck.fillLevel > 80 ? '#ef4444' : '#10b981'}
                  stroke="#1e293b"
                  strokeWidth="0.5"
                />
                {/* Truck Front Cabin */}
                <rect x="8" y="2" width="5" height="5" rx="0.5" fill="#e2e8f0" stroke="#1e293b" strokeWidth="0.5" />
                {/* Glowing headlight */}
                <circle cx="13" cy="5" r="0.7" fill="#fef08a" />
              </g>

              {/* Dynamic Fill Indicator Bar on top of truck cargo */}
              <rect
                x={prj.x - 5}
                y={prj.y - 12}
                width="8"
                height="2"
                fill="#475569"
                rx="0.5"
              />
              <rect
                x={prj.x - 5}
                y={prj.y - 12}
                width={8 * (truck.fillLevel / 100)}
                height="2"
                fill={truck.fillLevel > 80 ? '#ef4444' : '#34d399'}
                rx="0.5"
              />
            </g>
          );
        })}
      </svg>

      {/* Dynamic Hover Tooltip */}
      {hoveredItem && (
        <div
          id="map-element-tooltip"
          className="absolute z-20 pointer-events-none bg-slate-950/95 backdrop-blur-md border border-emerald-500/30 p-3.5 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.2)] flex flex-col max-w-[240px] transition-all"
          style={{
            left: `${hoveredItem.screenX}px`,
            top: `${hoveredItem.screenY - 20}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {hoveredItem.type === 'bin' && (
            <>
              <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
                <Trash2 className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold">IoT Smart Bin</span>
              </div>
              <h4 className="font-sans text-xs text-slate-100 font-semibold">{hoveredItem.data.name}</h4>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      hoveredItem.data.fillLevel >= 80 ? 'bg-red-500' : hoveredItem.data.fillLevel >= 50 ? 'bg-amber-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${hoveredItem.data.fillLevel}%` }}
                  ></div>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-300">{hoveredItem.data.fillLevel}%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 truncate">{hoveredItem.data.location.address}</span>
            </>
          )}

          {hoveredItem.type === 'truck' && (
            <>
              <div className="flex items-center gap-1.5 mb-1 text-teal-400">
                <TruckIcon className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Collection Vehicle</span>
              </div>
              <h4 className="font-sans text-xs text-slate-100 font-semibold">{hoveredItem.data.plateNumber}</h4>
              <div className="text-[10px] text-slate-400 mt-1">
                <p>Driver: <span className="text-slate-200 font-medium">{hoveredItem.data.driverName}</span></p>
                <p>Status: <span className={`font-semibold ${hoveredItem.data.status === 'Collecting' ? 'text-amber-400' : 'text-emerald-400'}`}>{hoveredItem.data.status}</span></p>
                <p>Load: <span className="text-slate-200">{hoveredItem.data.fillLevel}% capacity</span></p>
              </div>
            </>
          )}

          {hoveredItem.type === 'report' && (
            <>
              <div className="flex items-center gap-1.5 mb-1 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Active Hotspot</span>
              </div>
              <h4 className="font-sans text-xs text-slate-100 font-semibold truncate">{hoveredItem.data.title}</h4>
              <div className="text-[10px] text-slate-400 mt-1">
                <p>Urgency: <span className="text-rose-400 font-semibold">{hoveredItem.data.urgency}</span></p>
                <p>Reported By: <span className="text-slate-200">{hoveredItem.data.reporterName}</span></p>
                <p>Category: <span className="text-emerald-400 font-medium">{hoveredItem.data.category}</span></p>
              </div>
            </>
          )}

          {hoveredItem.type === 'building' && (
            <>
              <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Zone Structure</span>
              </div>
              <h4 className="font-sans text-xs text-slate-100 font-semibold">{hoveredItem.data.name}</h4>
              <span className="text-[9px] text-emerald-400 font-mono mt-1">Carbon Neutral Certified</span>
            </>
          )}
        </div>
      )}

      {/* Embedded Mini Legend Panel */}
      <div id="map-legend-box" className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-4 bg-slate-950/95 backdrop-blur-md border border-emerald-500/20 p-3 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span className="font-sans text-[10px] text-slate-400 font-medium">Clear Smart Bin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-sans text-[10px] text-slate-400 font-medium">Critical Smart Bin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1 bg-emerald-400"></div>
          <span className="font-sans text-[10px] text-slate-400 font-medium">Live truck</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-rose-500 font-bold text-xs">▲</span>
          <span className="font-sans text-[10px] text-slate-400 font-medium">Hazard Hotspot</span>
        </div>
      </div>
    </div>
  );
}
