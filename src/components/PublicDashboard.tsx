import React, { useState } from 'react';
import { Report, WasteCategory, UrgencyLevel, SmartBin, Truck } from '../types';
import { AlertTriangle, Plus, Clipboard, Award, Shield, CheckCircle, Flame, Calendar, Trash, Star, ThumbsUp, MapPin, UploadCloud, X, Building, Image as ImageIcon } from 'lucide-react';

interface PublicDashboardProps {
  reports: Report[];
  bins: SmartBin[];
  trucks: Truck[];
  currentUserEmail: string;
  currentUserName: string;
  currentUserPoints: number;
  onAddReport: (report: Omit<Report, 'id' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'reporterName' | 'reporterEmail'> & { reporterName?: string; reporterEmail?: string }) => void;
  onUpvoteReport: (reportId: string) => void;
  onEmptyMyBinSimulation: (binId: string) => void;
}

export default function PublicDashboard({
  reports,
  bins,
  trucks,
  currentUserEmail,
  currentUserName,
  currentUserPoints,
  onAddReport,
  onUpvoteReport,
  onEmptyMyBinSimulation,
}: PublicDashboardProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WasteCategory>('General');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [address, setAddress] = useState('');
  const [mapX, setMapX] = useState<number>(Math.floor(Math.random() * 60) + 20); // default coordinates
  const [mapY, setMapY] = useState<number>(Math.floor(Math.random() * 60) + 20);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoError, setPhotoError] = useState<string>('');

  // Home pick-up scheduler states
  const [pickupDate, setPickupDate] = useState('2026-07-16');
  const [pickupType, setPickupType] = useState('Recycling');
  const [pickupAddress, setPickupAddress] = useState('124 Market Street');
  const [pickupScheduled, setPickupScheduled] = useState(false);

  // Dynamic organization routing lookup based on Category selection
  const getRoutedOrgForCategory = (cat: WasteCategory): string => {
    switch (cat) {
      case 'Organic': return 'Municipal Compost & Organic Recovery Directorate';
      case 'Plastic': return 'Municipal Recycling & Recovery Authority';
      case 'Hazardous': return 'State Environmental Protection Agency (EPA)';
      case 'E-Waste': return 'Regional E-Waste Safe Recycling Consortium';
      case 'Overflowing Bin': return 'Rapid Response Sanitation Squad';
      case 'Illegal Dumping': return 'Municipal Environmental Compliance Enforcement Patrol';
      case 'General':
      default: return 'District Municipal Sanitation Division';
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !address) return;

    onAddReport({
      title,
      description,
      category,
      urgency,
      location: {
        x: mapX,
        y: mapY,
        address,
      },
      status: 'Pending',
      photoUrl: photoUrl || undefined,
      assignedOrg: getRoutedOrgForCategory(category),
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setAddress('');
    setCategory('General');
    setUrgency('Medium');
    setPhotoUrl('');
    setShowReportForm(false);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert click position to percentage (0-100)
    const pctX = Math.round((clickX / rect.width) * 100);
    const pctY = Math.round((clickY / rect.height) * 100);
    
    setMapX(pctX);
    setMapY(pctY);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processUploadedFile = (file: File) => {
    setPhotoError('');
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please upload an image file (PNG/JPG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (reader.result) {
        setPhotoUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  // Mock preset image options for easy testing
  const PRESET_TRASH_IMAGES = [
    { name: 'Overflowing Bin', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600' },
    { name: 'Hazardous Waste', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600' },
    { name: 'Debris/Pallets', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600' }
  ];

  return (
    <div id="public-dashboard-panel" className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-neon-emerald">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-400 font-mono tracking-widest font-bold uppercase block">Citizen Command Centre</span>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Welcome, {currentUserName}</h2>
          <p className="text-slate-350 text-xs">Manage your active waste reports, upvote hotspots, and schedule local home pick-ups.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-emerald-500/15 text-center shadow-neon-emerald">
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest">Your Impact</span>
            <span className="text-emerald-400 font-extrabold text-lg flex items-center gap-1 justify-center font-mono">
              <Award className="w-4 h-4" /> {currentUserPoints} GP
            </span>
          </div>
          <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-emerald-500/15 text-center shadow-neon-emerald">
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest">Active Logs</span>
            <span className="text-slate-200 font-extrabold text-lg font-mono">
              {reports.filter(r => r.reporterEmail === currentUserEmail).length} FILE(S)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form / Reports list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 tracking-tight">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Community Waste Incident Board
            </h3>

            <button
              onClick={() => {
                setShowReportForm(!showReportForm);
                // Randomize coordinates on open so it's fresh
                if(!showReportForm) {
                  setMapX(Math.floor(Math.random() * 50) + 25);
                  setMapY(Math.floor(Math.random() * 50) + 25);
                }
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-neon-emerald-btn"
            >
              <Plus className="w-4 h-4" />
              {showReportForm ? 'Close Form' : 'Log Incident'}
            </button>
          </div>

          {/* New Incident Form */}
          {showReportForm && (
            <form onSubmit={handleReportSubmit} className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/25 p-6 rounded-2xl space-y-5 animate-fadeIn shadow-neon-emerald">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest pb-2 border-b border-emerald-500/10">
                Lodge Citizen Waste Concern
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Report Title / Headline</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                    placeholder="e.g., Toxic batteries in park corner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Address / Sector Name</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                    placeholder="e.g., 405 University Blvd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Waste Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WasteCategory)}
                    className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="Organic">Organic Waste</option>
                    <option value="Plastic">Plastics & Recycling</option>
                    <option value="Hazardous">Hazardous Chemicals</option>
                    <option value="E-Waste">Electronics / E-Waste</option>
                    <option value="Overflowing Bin">Overflowing Bin</option>
                    <option value="Illegal Dumping">Illegal Dumping</option>
                    <option value="General">General Garbage</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Urgency Rating</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                    className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="Low">Low (Mild litter)</option>
                    <option value="Medium">Medium (Regular cluster)</option>
                    <option value="High">High (Blocking access / stinking)</option>
                    <option value="Critical">Critical (Toxic spills / hazard)</option>
                  </select>
                </div>
              </div>

              {/* Pinpoint Location on visual Map */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pinpoint Waste Location on City Grid</label>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/10">
                    Coords: X: {mapX}, Y: {mapY}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Click on the visual map area below to drag/place the precise collection coordinates:</p>
                <div 
                  onClick={handleMapClick}
                  className="w-full h-44 bg-slate-950 rounded-xl relative border border-emerald-500/20 hover:border-emerald-500/40 cursor-crosshair overflow-hidden transition-all shadow-inner group"
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-40"></div>
                  
                  {/* Mock Blocks/Buildings */}
                  <div className="absolute top-[20%] left-[15%] w-12 h-8 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-center text-[8px] text-slate-650 font-mono select-none">GRID-A</div>
                  <div className="absolute top-[10%] left-[55%] w-16 h-10 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-center text-[8px] text-slate-650 font-mono select-none">MKT-ZONE</div>
                  <div className="absolute top-[60%] left-[10%] w-14 h-14 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-center text-[8px] text-slate-650 font-mono select-none">RES-BLK</div>
                  <div className="absolute top-[50%] left-[65%] w-20 h-10 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-center text-[8px] text-slate-650 font-mono select-none">CIVIC-CTR</div>
                  <div className="absolute bottom-3 right-8 w-14 h-8 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-center text-[8px] text-slate-650 font-mono select-none">EP-DEPOT</div>
                  
                  {/* Treatment Depot Marker */}
                  <div className="absolute bottom-[10%] right-[10%] w-3 h-3 bg-blue-500/30 border border-blue-500 rounded-full animate-ping"></div>
                  <span className="absolute bottom-[8%] right-[13%] text-[7px] text-blue-400 font-mono uppercase">Depot</span>

                  {/* User selected Pinpoint Marker */}
                  <div 
                    className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none flex flex-col items-center"
                    style={{ left: `${mapX}%`, top: `${mapY}%` }}
                  >
                    <MapPin className="w-5 h-5 text-rose-500 filter drop-shadow-[0_0_5px_rgba(239,68,68,0.7)] animate-bounce" />
                    <span className="bg-rose-500 text-slate-950 font-mono font-bold text-[8px] px-1 rounded -mt-0.5 whitespace-nowrap">
                      ({mapX}, {mapY})
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 text-[8px] text-slate-500 font-mono uppercase pointer-events-none group-hover:text-emerald-400 transition-colors">
                    Click anywhere on this canvas to set GPS pinpoint coordinates
                  </div>
                </div>
              </div>

              {/* Photo Upload Area with Drag-and-Drop */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Upload Waste Photo (Optional)</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                    dragActive 
                      ? 'border-emerald-400 bg-emerald-500/10' 
                      : photoUrl 
                      ? 'border-emerald-500/40 bg-slate-900/60' 
                      : photoError
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : 'border-emerald-500/10 hover:border-emerald-500/30'
                  }`}
                >
                  {photoUrl ? (
                    <div className="space-y-3 w-full">
                      <div className="relative w-28 h-28 mx-auto rounded-lg overflow-hidden border border-emerald-500/30 shadow-md">
                        <img src={photoUrl} alt="Trash Incident Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => { setPhotoUrl(''); setPhotoError(''); }}
                          className="absolute top-1 right-1 bg-slate-950/80 rounded-full p-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">Photo uploaded successfully!</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-500 mb-2" />
                      <p className="text-xs text-slate-350">
                        Drag & drop your trash photo here, or <label className="text-emerald-400 hover:underline cursor-pointer"><input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />browse file</label>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG (Max 5MB)</p>
                      {photoError && (
                        <p className="text-[10px] text-rose-400 font-semibold mt-1 animate-pulse">{photoError}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Preset Mock Photos for easy click logging */}
                {!photoUrl && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Or select a quick demo image mockup:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_TRASH_IMAGES.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoUrl(img.url)}
                          className="text-[9px] px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-emerald-500/10 hover:border-emerald-500/30 rounded-lg text-slate-400 transition-colors cursor-pointer"
                        >
                          {img.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Detailed Hazard Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="Explain the garbage pile details, odors, hazards, or approximate size of waste for sanitation truck dispatch."
                ></textarea>
              </div>

              {/* Routed Organization pill */}
              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/10 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">GOVERNMENTAL ROUTING DESTINATION:</span>
                <span className="text-emerald-400 text-xs font-bold font-sans flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  {getRoutedOrgForCategory(category)}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 bg-slate-850 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-neon-emerald-btn cursor-pointer"
                >
                  Publish Report (+50 GP)
                </button>
              </div>
            </form>
          )}

          {/* Incidents List */}
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-8 rounded-2xl text-center text-slate-500 text-xs">
                No active community reports registered. Click "Log New Incident" to file one.
              </div>
            ) : (
              reports.map((rep) => {
                const hasUpvoted = rep.upvotedBy.includes(currentUserEmail);
                const isMyReport = rep.reporterEmail === currentUserEmail;

                return (
                  <div
                    key={rep.id}
                    className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-5 rounded-2xl space-y-4 hover:border-emerald-500/30 hover:shadow-neon-emerald transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              rep.urgency === 'Critical' || rep.urgency === 'High'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {rep.urgency} Priority
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {rep.id}</span>
                          {isMyReport && (
                            <span className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">
                              My Submission
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-slate-200">{rep.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
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
                    </div>

                    <p className="text-slate-350 text-xs leading-relaxed">{rep.description}</p>

                    {rep.photoUrl && (
                      <div className="mt-2.5 max-w-sm rounded-xl overflow-hidden border border-emerald-500/20 shadow-lg relative group">
                        <img src={rep.photoUrl} alt={rep.title} className="w-full h-36 object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Image Logged
                        </div>
                      </div>
                    )}

                    {rep.assignedOrg && (
                      <div className="mt-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-400" />
                        Routed to: <strong className="text-slate-200 font-bold">{rep.assignedOrg}</strong>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500 font-mono pt-2 border-t border-emerald-500/5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> Sector: ({rep.location.x}, {rep.location.y}) - {rep.location.address}
                      </span>
                      <span>Category: <strong className="text-slate-350 font-bold">{rep.category}</strong></span>
                      <span>Filed: {rep.createdAt} by <span className="text-slate-350">{rep.reporterName}</span></span>
                    </div>

                    {/* Upvote & Action Area */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => onUpvoteReport(rep.id)}
                        disabled={rep.status === 'Resolved' || hasUpvoted}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                          hasUpvoted
                            ? 'bg-slate-950 text-emerald-400 border border-emerald-500/25'
                            : rep.status === 'Resolved'
                            ? 'bg-slate-850 text-slate-600 cursor-not-allowed border border-slate-800'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-emerald-500/15'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                        {hasUpvoted ? 'Upvoted' : 'Upvote Clean-up'} ({rep.upvotes})
                      </button>

                      {rep.status === 'Dispatched' && (
                        <span className="text-[10px] text-blue-400 font-bold animate-pulse uppercase tracking-widest">
                          🚛 Fleet units dispatched to Sector
                        </span>
                      )}

                      {rep.status === 'Resolved' && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Sector Cleared
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Home Pickup & Smart IoT Bin Alert status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Home pickup Scheduler */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 tracking-tight">
              <Calendar className="w-4.5 h-4.5 text-emerald-400" />
              Schedule Home Bulk Pickup
            </h3>
            <p className="text-xs text-slate-400">
              Need special disposal for large wood, chemical containers, or bulk recyclables? Request our sanitation division directly.
            </p>

            {pickupScheduled ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2 text-center animate-fadeIn shadow-neon-emerald">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Pickup Scheduled!</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Municipal team will arrive on <span className="font-semibold text-emerald-400">{pickupDate}</span> at <span className="text-slate-300">{pickupAddress}</span>. Keep the items packaged outside your main gate.
                </p>
                <button
                  onClick={() => setPickupScheduled(false)}
                  className="text-[10px] text-emerald-400 underline font-bold uppercase tracking-wider hover:text-emerald-300 pt-1 cursor-pointer"
                >
                  Schedule Another
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Category Type</label>
                  <select
                    value={pickupType}
                    onChange={(e) => setPickupType(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/15 rounded-lg py-1.5 px-2 text-xs text-slate-350 focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="Recycling">Paper/Plastic Dry Bundle</option>
                    <option value="Organic">Bulk Garden Composts</option>
                    <option value="Hazardous">Chemical cans & Paint</option>
                    <option value="E-Waste">Old Fridges & CRT TVs</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Requested Date</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/15 rounded-lg py-1.5 px-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pickup Street Address</label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/15 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                    placeholder="e.g., 124 Market Street"
                  />
                </div>

                <button
                  onClick={() => setPickupScheduled(true)}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider rounded-xl text-xs cursor-pointer transition-all mt-2 shadow-neon-emerald-btn"
                >
                  Book Municipal Crew
                </button>
              </div>
            )}
          </div>

          {/* Quick Smart Bin Simulator for Testing Fill Alerts */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 tracking-tight">
              <Star className="w-4.5 h-4.5 text-amber-400" />
              Your Neighborhood Smart Bins
            </h3>
            <p className="text-xs text-slate-400">
              Is your street bin filling up? Trigger a simulated local disposal and see the IOT sensors spike in real-time!
            </p>

            <div className="space-y-3">
              {bins.slice(0, 3).map((bin) => (
                <div key={bin.id} className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/10 flex flex-col gap-2 shadow-neon-emerald">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200 truncate max-w-[150px]">{bin.name}</span>
                    <span
                      className={`font-mono font-bold ${
                        bin.fillLevel >= 80 ? 'text-rose-400' : bin.fillLevel >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {bin.fillLevel}% Full
                    </span>
                  </div>

                  <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        bin.fillLevel >= 80 ? 'bg-rose-500' : bin.fillLevel >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${bin.fillLevel}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Type: {bin.type}</span>
                    <button
                      onClick={() => onEmptyMyBinSimulation(bin.id)}
                      className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Fill up bin (test alert)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
