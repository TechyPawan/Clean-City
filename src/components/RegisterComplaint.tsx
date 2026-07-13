import React, { useState } from 'react';
import { Report, WasteCategory, UrgencyLevel, SmartBin, Truck } from '../types';
import { 
  AlertTriangle, 
  MapPin, 
  UploadCloud, 
  X, 
  Building, 
  Image as ImageIcon, 
  Plus, 
  ThumbsUp, 
  CheckCircle, 
  Info, 
  Trash2, 
  ShieldAlert, 
  Maximize2, 
  User, 
  Mail, 
  Activity, 
  Grid,
  Filter,
  Search,
  Scale
} from 'lucide-react';

interface RegisterComplaintProps {
  reports: Report[];
  loggedInUser: { name: string; email: string; points: number; role: string } | null;
  onAddReport: (report: Omit<Report, 'id' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'reporterName' | 'reporterEmail'> & { reporterName?: string; reporterEmail?: string }) => void;
  onUpvoteReport: (reportId: string) => void;
  bins: SmartBin[];
}

export default function RegisterComplaint({
  reports,
  loggedInUser,
  onAddReport,
  onUpvoteReport,
  bins,
}: RegisterComplaintProps) {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WasteCategory>('General');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [address, setAddress] = useState('');
  const [mapX, setMapX] = useState<number>(Math.floor(Math.random() * 50) + 25);
  const [mapY, setMapY] = useState<number>(Math.floor(Math.random() * 50) + 25);
  
  // Guest details (used if not logged in)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Wastage Estimator states
  const [wastageArea, setWastageArea] = useState<string>('Medium Area (2-10 sq meters)');
  const [wastageVolume, setWastageVolume] = useState<string>('Single Sanitation Truck Load');
  
  // Image states
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [photoError, setPhotoError] = useState<string>('');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Success indicator state
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Quick select preset mockup images
  const COMPLAINT_PRESETS = [
    { name: 'Overflowing Bin', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600' },
    { name: 'Hazardous Spill', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600' },
    { name: 'Construction Rubble', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600' },
    { name: 'Alleyway Dumping', url: 'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=600' }
  ];

  // Wastage area detailed options
  const AREA_OPTIONS = [
    { key: 'Small', label: 'Small Pile (< 2 sqm / 20 sqft)', desc: 'Scattered litter, loose bags, or single item. Quick sweep.', points: 50, color: 'border-emerald-500/35 text-emerald-400 bg-emerald-500/5' },
    { key: 'Medium', label: 'Medium Area (2-10 sqm / ~100 sqft)', desc: 'Overflowing dumpsters, cluster of household trash. Requires crew.', points: 50, color: 'border-amber-500/35 text-amber-400 bg-amber-500/5' },
    { key: 'Large', label: 'Large Wasteland (10-50 sqm / ~500 sqft)', desc: 'Construction rubble, piles of wood, heavy appliances. Needs truck.', points: 75, color: 'border-orange-500/35 text-orange-400 bg-orange-500/5' },
    { key: 'Massive', label: 'Massive Dump (> 50 sqm / 500+ sqft)', desc: 'Industrial chemical spill, large-scale community landfill. EPA scale.', points: 75, color: 'border-rose-500/35 text-rose-400 bg-rose-500/5' }
  ];

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

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const pctX = Math.round((clickX / rect.width) * 100);
    const pctY = Math.round((clickY / rect.height) * 100);
    
    setMapX(pctX);
    setMapY(pctY);
  };

  // Drag and drop image handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !address) return;

    // Call callback with new report parameters
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
      wastageArea,
      wastageVolume,
      reporterName: loggedInUser ? loggedInUser.name : (guestName || 'Anonymous Citizen'),
      reporterEmail: loggedInUser ? loggedInUser.email : (guestEmail || 'anonymous@cityclean.gov'),
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setAddress('');
    setPhotoUrl('');
    setGuestName('');
    setGuestEmail('');
    setShowSuccessToast(true);

    // Auto close toast
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  // Filter complaints list
  const filteredReports = reports.filter(rep => {
    const matchesSearch = 
      rep.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      rep.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || rep.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || rep.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getUrgencyColor = (urg: UrgencyLevel) => {
    switch (urg) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
      case 'High': return 'bg-orange-500/10 text-orange-400 border border-orange-500/25';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'Low': return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
    }
  };

  return (
    <div id="register-complaint-viewport" className="space-y-8 animate-fadeIn">
      {/* Visual Header */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-neon-emerald">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-400 font-mono tracking-widest font-bold uppercase block">Official Waste Complaint registry</span>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Register Citizen Complaint & wastage areas</h2>
          <p className="text-slate-350 text-xs">Upload geotagged photographic waste logs, quantify the extent of debris, and dispatch municipal sanitation assets.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-emerald-500/15 text-center shadow-neon-emerald">
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest">Active Complaints</span>
            <span className="text-emerald-400 font-extrabold text-lg font-mono">
              {reports.length} ACTIVE LOGS
            </span>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/35 p-4 rounded-xl text-slate-200 text-xs flex items-center justify-between shadow-neon-emerald animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-emerald-400 uppercase font-bold block">Complaint Submitted Successfully!</strong>
              <span>Citizen dispatch request has been processed. The dispatch center is routing sanitation teams.</span>
            </div>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Complaint Registration Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleComplaintSubmit} className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 p-6 rounded-2xl space-y-6 shadow-neon-emerald relative">
            
            {/* Form Title */}
            <div className="border-b border-emerald-500/10 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
                Lodge Environmental Concern
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">STEP 1 of 2</span>
            </div>

            {/* Complainant Identity */}
            {!loggedInUser ? (
              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" /> 
                  Complainant Identity Details (Guest Mode)
                </span>
                <p className="text-[10px] text-slate-500">You are not logged in. Provide your name and email to receive live SMS and routing emails on cleanup progress:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-slate-950 border border-emerald-500/15 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full bg-slate-950 border border-emerald-500/15 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  Logged as: <strong className="text-slate-200">{loggedInUser.name}</strong> ({loggedInUser.email})
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                  Member verified
                </span>
              </div>
            )}

            {/* Core Fields: Title and General Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Complaint Title / Subject</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="e.g., Extreme organic decay near primary school gate"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Street Address or landmark</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="e.g., Corner of 4th Avenue and Pine Street"
                />
              </div>
            </div>

            {/* Categories & Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Waste Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WasteCategory)}
                  className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="General">General Garbage / Rubbish</option>
                  <option value="Illegal Dumping">Illegal Roadside Dumping</option>
                  <option value="Overflowing Bin">Overflowing Public Container</option>
                  <option value="Organic">Organic Waste / Decomposition</option>
                  <option value="Plastic">Plastics, Cans & Bottles</option>
                  <option value="Hazardous">Hazardous Chemicals / Oils</option>
                  <option value="E-Waste">Discarded Computers & Electronics</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Urgency Rating</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="Low">Low Priority (Small scattered items)</option>
                  <option value="Medium">Medium Priority (Blocks, regular piles)</option>
                  <option value="High">High Priority (Foul odor, blocking sidewalks)</option>
                  <option value="Critical">Critical Priority (Toxic hazard, blocked main road)</option>
                </select>
              </div>
            </div>

            {/* AREA OF WASTAGE REPORTING AND VISUALIZER */}
            <div className="bg-slate-950/70 border border-emerald-500/10 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Interactive Wastage Area Estimator
                </h4>
                <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Dynamic sizing
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Estimate the approximate physical footprint ("the area of wastage") of the debris. Accurate estimations help administrative coordinators dispatch trucks with appropriate capacity.
              </p>

              {/* Area options grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AREA_OPTIONS.map((opt) => {
                  const isSelected = wastageArea.startsWith(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setWastageArea(opt.label);
                        // Auto-assign logical volumes based on selection
                        if (opt.key === 'Small') setWastageVolume('Light load (Fits in normal bags)');
                        else if (opt.key === 'Medium') setWastageVolume('Single Sanitation Truck Load');
                        else if (opt.key === 'Large') setWastageVolume('Double sanitation truck load');
                        else setWastageVolume('Multiple Heavy Dumpers & Shovels required');
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? `${opt.color} border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]` 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>{opt.key} Area</span>
                          {opt.points > 50 && (
                            <span className="text-[8px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1 py-0.5 rounded font-mono uppercase font-bold">
                              +{opt.points} GP Bonus
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-slate-400 mt-2 block pt-1 border-t border-slate-850">
                        Size: {opt.label.split('(')[1]?.replace(')', '') || opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic CSS Visual Grid Visualizer representing wastage footprint */}
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/5 space-y-3">
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <span>Footprint representation ({wastageArea.split(' ')[0]} scale)</span>
                  <span className="text-emerald-400 uppercase font-bold">Estimated Vol: {wastageVolume.split(' ')[0]}</span>
                </div>

                <div className="relative h-14 bg-slate-900 border border-emerald-500/10 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:10px_10px] opacity-40"></div>
                  
                  {/* Visual block representing volume */}
                  <div 
                    className={`h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-500 relative px-3 text-[10px] font-mono font-bold ${
                      wastageArea.startsWith('Small') 
                        ? 'w-24 bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                        : wastageArea.startsWith('Medium')
                        ? 'w-48 bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : wastageArea.startsWith('Large')
                        ? 'w-72 bg-orange-500/10 border-orange-500/40 text-orange-400 animate-pulse'
                        : 'w-full mx-4 bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    Estimated Waste Area: {wastageArea.substring(wastageArea.indexOf('('))}
                  </div>
                </div>

                {/* Extra selection for exact Waste Volume */}
                <div className="space-y-1 pt-1">
                  <label className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Manual Volume override</label>
                  <select
                    value={wastageVolume}
                    onChange={(e) => setWastageVolume(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[10px] text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Light load (Fits in normal bags)">Light load (Fits in normal bags)</option>
                    <option value="Single Sanitation Truck Load">Single Sanitation Truck Load</option>
                    <option value="Double sanitation truck load">Double sanitation truck load</option>
                    <option value="Multiple Heavy Dumpers & Shovels required">Multiple Heavy Dumpers & Shovels required</option>
                  </select>
                </div>
              </div>
            </div>

            {/* GPS Grid pinpoint map picker */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Set precise Wastage GPS on Grid</label>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2.5 py-0.5 rounded border border-emerald-500/10">
                  Sector coords: ({mapX}, {mapY})
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Tap anywhere on the city map block to mark where the trash heap is situated:</p>
              
              <div 
                onClick={handleMapClick}
                className="w-full h-40 bg-slate-950 rounded-xl relative border border-emerald-500/15 hover:border-emerald-500/30 cursor-crosshair overflow-hidden transition-all shadow-inner group"
              >
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-35"></div>
                
                {/* Visual obstacles */}
                <div className="absolute top-[15%] left-[20%] w-14 h-6 bg-slate-900/60 border border-slate-800 rounded text-[7px] text-slate-600 font-mono flex items-center justify-center select-none">MKT-BLKS</div>
                <div className="absolute bottom-[20%] left-[10%] w-16 h-10 bg-slate-900/60 border border-slate-800 rounded text-[7px] text-slate-600 font-mono flex items-center justify-center select-none">PARKWAY-GRN</div>
                <div className="absolute top-[40%] right-[25%] w-16 h-8 bg-slate-900/60 border border-slate-800 rounded text-[7px] text-slate-600 font-mono flex items-center justify-center select-none">RECYC-DEPOT</div>
                
                {/* User Pinpoint marker */}
                <div 
                  className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none flex flex-col items-center"
                  style={{ left: `${mapX}%`, top: `${mapY}%` }}
                >
                  <MapPin className="w-5 h-5 text-rose-500 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-bounce" />
                  <span className="bg-rose-500 text-slate-950 font-mono font-bold text-[8px] px-1 rounded -mt-0.5 whitespace-nowrap">
                    ({mapX}, {mapY})
                  </span>
                </div>

                <div className="absolute bottom-1.5 left-2 text-[8px] text-slate-500 font-mono uppercase">
                  Click on map grid to locate complaint epicenter
                </div>
              </div>
            </div>

            {/* Photo Upload Area with Drag-and-Drop */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Complaint photographic Evidence (Highly Recommended)</label>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                  dragActive 
                    ? 'border-emerald-400 bg-emerald-500/10' 
                    : photoUrl 
                    ? 'border-emerald-500/40 bg-slate-900/50' 
                    : photoError
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : 'border-emerald-500/10 hover:border-emerald-500/25 bg-slate-950/30'
                }`}
              >
                {photoUrl ? (
                  <div className="space-y-3 w-full">
                    <div className="relative w-24 h-24 mx-auto rounded-lg overflow-hidden border border-emerald-500/30 shadow-md">
                      <img src={photoUrl} alt="Complaint preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => { setPhotoUrl(''); setPhotoError(''); }}
                        className="absolute top-1 right-1 bg-slate-950/90 rounded-full p-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-mono uppercase tracking-wider">Geotagged image attachment ready</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-7 h-7 text-slate-500 mb-1.5" />
                    <p className="text-xs text-slate-300">
                      Drag & drop waste photo here, or{' '}
                      <label className="text-emerald-400 hover:underline cursor-pointer font-semibold">
                        browse file
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Accepts PNG, JPG (Max 5MB)</p>
                    {photoError && (
                      <p className="text-[10px] text-rose-400 font-semibold mt-1 animate-pulse">{photoError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Demo quick testing image presets */}
              {!photoUrl && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Or click a demo photo log to simulate capture:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMPLAINT_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(p.url)}
                        className="text-[9px] px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-emerald-500/10 hover:border-emerald-500/35 rounded-lg text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        📷 {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Complaint description */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Complaint details & context</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-500/15 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                placeholder="Describe details regarding blockages, chemical leak, smell warnings, proximity to houses, or exact timeline of illegal dumping."
              ></textarea>
            </div>

            {/* Municipal routing overview */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-500 font-mono block">AUTOMATED GOVERNMENT DEPARTMENT ROUTING:</span>
                <span className="text-slate-200 text-xs font-bold font-sans flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  {getRoutedOrgForCategory(category)}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 shrink-0">
                Direct Dispatch Link
              </span>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-neon-emerald-btn transition-all duration-150 cursor-pointer text-center"
              >
                Submit Citizen Complaint ({wastageArea.includes('Large') || wastageArea.includes('Massive') ? '+75' : '+50'} GP)
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Registered Complaints & wastage Area Log Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-500/10 p-5 rounded-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Complaints Log
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Real-time tracking feed of public registered complaints and waste hotspots reported by citizens.
              </p>
            </div>

            {/* Filters and Search */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs by keyword or street..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="text-[9px] text-slate-500 block uppercase font-bold mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-slate-350 cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="General">General Garbage</option>
                    <option value="Illegal Dumping">Illegal Dumping</option>
                    <option value="Overflowing Bin">Overflowing Bins</option>
                    <option value="Organic">Organic Decay</option>
                    <option value="Plastic">Plastics & Recycling</option>
                    <option value="Hazardous">Hazardous</option>
                    <option value="E-Waste">Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block uppercase font-bold mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-slate-350 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredReports.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No matching registered complaints found.
                </div>
              ) : (
                filteredReports.map((rep) => {
                  const hasUpvoted = loggedInUser && rep.upvotedBy.includes(loggedInUser.email);
                  
                  return (
                    <div 
                      key={rep.id} 
                      className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 hover:border-emerald-500/20 transition-all duration-200 space-y-3 shadow-inner"
                    >
                      {/* Priority Tag & ID */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono tracking-widest ${getUrgencyColor(rep.urgency)}`}>
                          {rep.urgency}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] font-bold font-mono uppercase px-1.5 py-0.5 rounded ${
                            rep.status === 'Resolved' 
                              ? 'bg-emerald-500/15 text-emerald-400' 
                              : rep.status === 'Dispatched'
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-slate-850 text-slate-400'
                          }`}>
                            ● {rep.status}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500">ID: {rep.id}</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200 tracking-tight">{rep.title}</h4>
                        <p className="text-[10px] text-slate-450 leading-relaxed line-clamp-3">{rep.description}</p>
                      </div>

                      {/* Reported Photographic Evidence */}
                      {rep.photoUrl && (
                        <div className="relative rounded-lg overflow-hidden border border-slate-800 h-24 shadow-sm group">
                          <img src={rep.photoUrl} alt={rep.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                          <div className="absolute top-1.5 left-1.5 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-emerald-400 flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5" /> Evidence Attached
                          </div>
                        </div>
                      )}

                      {/* Area of Wastage metric labels */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-900 text-[9px] font-mono">
                        <div className="bg-slate-900/50 p-1.5 rounded border border-slate-850 text-slate-400">
                          <span className="text-[8px] text-slate-500 block">WASTAGE AREA:</span>
                          <span className="text-emerald-400 font-bold truncate block">{rep.wastageArea || 'Medium Footprint'}</span>
                        </div>
                        <div className="bg-slate-900/50 p-1.5 rounded border border-slate-850 text-slate-400">
                          <span className="text-[8px] text-slate-500 block">ESTIMATED VOLUME:</span>
                          <span className="text-teal-400 font-bold truncate block">{rep.wastageVolume || 'Standard Truck'}</span>
                        </div>
                      </div>

                      {/* Assigned Government Office */}
                      {rep.assignedOrg && (
                        <div className="text-[8px] text-slate-450 font-mono bg-slate-900/40 p-1.5 rounded border border-slate-900 flex items-center gap-1">
                          <Building className="w-3 h-3 text-emerald-500" />
                          Routed: <strong className="text-slate-300">{rep.assignedOrg}</strong>
                        </div>
                      )}

                      {/* Reporter & Upvote Row */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[8px] text-slate-500 font-mono">
                        <span className="truncate max-w-[150px]">By: {rep.reporterName}</span>
                        <button
                          type="button"
                          disabled={rep.status === 'Resolved' || !loggedInUser || hasUpvoted}
                          onClick={() => onUpvoteReport(rep.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                            hasUpvoted 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : !loggedInUser 
                              ? 'text-slate-500 bg-slate-900 cursor-not-allowed'
                              : 'hover:bg-slate-900 text-slate-350 hover:text-emerald-400'
                          }`}
                        >
                          <ThumbsUp className="w-2.5 h-2.5" />
                          Upvote ({rep.upvotes})
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
