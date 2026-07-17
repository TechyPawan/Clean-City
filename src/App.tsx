import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SmartBin, Truck, Report, Campaign, User, UserRole, SystemNotification } from './types';
import { INITIAL_BINS, INITIAL_TRUCKS, INITIAL_REPORTS, INITIAL_CAMPAIGNS } from './mockData';
import CityMap from './components/CityMap';
import LandingHero from './components/LandingHero';
import MunicipalHub from './components/MunicipalHub';
import PortalAuth from './components/PortalAuth';
import PublicDashboard from './components/PublicDashboard';
import AdminDashboard from './components/AdminDashboard';
import RegisterComplaint from './components/RegisterComplaint';
import ThreeDBackground from './components/ThreeDBackground';
import Logo from './components/Logo';
import SupabaseStatusPanel from './components/SupabaseStatusPanel';
import { 
  verifySupabaseConnection, 
  getSupabaseReports, 
  insertSupabaseReport, 
  updateSupabaseReport, 
  getSupabaseBins, 
  updateSupabaseBin, 
  getSupabaseTrucks, 
  updateSupabaseTruck, 
  getSupabaseCampaigns, 
  updateSupabaseCampaign, 
  getSupabaseUser, 
  upsertSupabaseUser, 
  updateSupabaseUserPoints,
  seedSupabaseDatabase
} from './supabaseService';
import { Trash2, Truck as TruckIcon, AlertTriangle, ShieldCheck, LogOut, Map as MapIcon, User as UserIcon, Landmark, Star, Award, HeartHandshake, Info, Bell, Send, MessageSquare, X, Sparkles, Check, Image, Building, ClipboardList, Shield, Database } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'map' | 'hub' | 'portal' | 'complaint'>('landing');
  
  // Initialization & Boot loader States
  const [isInitializing, setIsInitializing] = useState(true);
  const [initProgress, setInitProgress] = useState(0);
  const [initLogs, setInitLogs] = useState<string[]>([]);

  // App States
  const [bins, setBins] = useState<SmartBin[]>(INITIAL_BINS);
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Supabase Status State
  const [showDbStatus, setShowDbStatus] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    isConnected: boolean;
    missingTables: string[];
    isFetching: boolean;
    error: string | null;
  }>({
    isConnected: false,
    missingTables: [],
    isFetching: true,
    error: null,
  });

  // Database status checking and sync function
  const triggerDbRefresh = async () => {
    setSupabaseStatus((prev) => ({ ...prev, isFetching: true }));
    try {
      const statusState = await verifySupabaseConnection();
      if (statusState.isConnected) {
        if (statusState.missingTables.length === 0) {
          // Sync live state from Supabase
          await seedSupabaseDatabase(); // Auto seed if empty
          const [dbReports, dbBins, dbTrucks, dbCampaigns] = await Promise.all([
            getSupabaseReports(),
            getSupabaseBins(),
            getSupabaseTrucks(),
            getSupabaseCampaigns()
          ]);
          setReports(dbReports);
          setBins(dbBins);
          setTrucks(dbTrucks);
          setCampaigns(dbCampaigns);

          setSupabaseStatus({
            isConnected: true,
            missingTables: [],
            isFetching: false,
            error: null
          });
        } else {
          setSupabaseStatus({
            isConnected: true,
            missingTables: statusState.missingTables,
            isFetching: false,
            error: `Missing tables: ${statusState.missingTables.join(', ')}`
          });
        }
      } else {
        setSupabaseStatus({
          isConnected: false,
          missingTables: [],
          isFetching: false,
          error: statusState.errorMessage
        });
      }
    } catch (err: any) {
      setSupabaseStatus({
        isConnected: false,
        missingTables: [],
        isFetching: false,
        error: err.message || 'Verification failed'
      });
    }
  };

  // Initial Supabase Load
  useEffect(() => {
    triggerDbRefresh();
  }, []);

  // Notifications & AI Assistant states
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'Collection Completed',
      message: 'Fleet TX-431-ECO completed organic waste collection in Sector (15, 45).',
      timestamp: '2026-07-13 06:15',
      type: 'success',
      channel: 'In-App',
      recipient: 'Admin',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Route Scheduled',
      message: 'Fleet TX-892-CLEAN route scheduled to address overflowing bin at Sector (30, 25).',
      timestamp: '2026-07-13 08:35',
      type: 'info',
      channel: 'Push',
      recipient: 'arjun.mehta@gmail.com',
      read: false,
    }
  ]);
  const [toast, setToast] = useState<SystemNotification | null>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Helper to trigger notifications with simulated target channels
  const triggerNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'alert',
    channel: 'In-App' | 'Push' | 'SMS' | 'Email',
    recipient: string
  ) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type,
      channel,
      recipient,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setToast(newNotif);
    setTimeout(() => {
      setToast((current) => (current?.id === newNotif.id ? null : current));
    }, 6000);
  };

  // User Actions
  const handleLogin = async (role: UserRole, email: string, name: string) => {
    const defaultUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      points: role === 'public' ? 120 : 0, // start with points for citizens
    };
    setLoggedInUser(defaultUser);
    setCurrentTab('map');

    try {
      if (supabaseStatus.isConnected && supabaseStatus.missingTables.length === 0) {
        const dbUser = await getSupabaseUser(email);
        if (dbUser) {
          setLoggedInUser(dbUser);
        } else {
          await upsertSupabaseUser(defaultUser);
        }
      }
    } catch (err) {
      console.warn('Supabase User Sync Error:', err);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentTab('landing');
  };

  // Dynamic Cleanliness Index calculation
  const cityCleanlinessIndex = useMemo(() => {
    const avgFill = bins.reduce((acc, curr) => acc + curr.fillLevel, 0) / bins.length;
    const activeUnresolvedReports = reports.filter((r) => r.status !== 'Resolved').length;
    
    // Base score is 100. Lowered by bin accumulation and unresolved community issues.
    const score = Math.max(0, Math.min(100, Math.round(100 - (avgFill * 0.18) - (activeUnresolvedReports * 3))));
    return score;
  }, [bins, reports]);

  // Citizen adds a report
  const handleAddReport = async (newRep: Omit<Report, 'id' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'reporterName' | 'reporterEmail'> & { reporterName?: string; reporterEmail?: string }) => {
    const freshReport: Report = {
      ...newRep,
      id: `rep-${Math.floor(Math.random() * 900) + 100}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      upvotes: 1,
      upvotedBy: loggedInUser ? [loggedInUser.email] : [],
      reporterName: loggedInUser ? loggedInUser.name : (newRep.reporterName || 'Anonymous Citizen'),
      reporterEmail: loggedInUser ? loggedInUser.email : (newRep.reporterEmail || 'anonymous@cityclean.gov'),
    };

    setReports((prev) => [freshReport, ...prev]);

    // Reward points to the reporting citizen
    let rewardPoints = 50;
    if (loggedInUser && loggedInUser.role === 'public') {
      rewardPoints = freshReport.wastageArea?.includes('Large') || freshReport.wastageArea?.includes('Massive') ? 75 : 50;
      setLoggedInUser((prev) => prev ? { ...prev, points: prev.points + rewardPoints } : null);
      
      triggerNotification(
        'Points Earned!',
        `Your complaint was registered. You earned +${rewardPoints} Green Points for reporting wastage scale: ${freshReport.wastageArea || 'General'}!`,
        'success',
        'In-App',
        loggedInUser.email
      );
    } else {
      triggerNotification(
        'Guest Complaint Filed',
        `Guest Complaint successfully registered. Location: Sector (${freshReport.location.x}, ${freshReport.location.y}). Automated routing active.`,
        'success',
        'In-App',
        'Admin'
      );
    }
    setHighlightedId(freshReport.id);

    try {
      if (supabaseStatus.isConnected && supabaseStatus.missingTables.length === 0) {
        await insertSupabaseReport(freshReport);
        if (loggedInUser && loggedInUser.role === 'public') {
          await updateSupabaseUserPoints(loggedInUser.email, loggedInUser.points + rewardPoints);
        }
      }
    } catch (err) {
      console.warn('Supabase Insert Report Error:', err);
    }
  };

  // Citizen upvotes a reported hotspot to indicate municipal priority
  const handleUpvoteReport = async (reportId: string) => {
    if (!loggedInUser) return;
    
    let updatedRep: Report | null = null;
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId && !r.upvotedBy.includes(loggedInUser.email)) {
          updatedRep = {
            ...r,
            upvotes: r.upvotes + 1,
            upvotedBy: [...r.upvotedBy, loggedInUser.email],
          };
          return updatedRep;
        }
        return r;
      })
    );

    try {
      if (supabaseStatus.isConnected && supabaseStatus.missingTables.length === 0 && updatedRep) {
        await updateSupabaseReport(reportId, {
          upvotes: (updatedRep as Report).upvotes,
          upvotedBy: (updatedRep as Report).upvotedBy
        });
      }
    } catch (err) {
      console.warn('Supabase Upvote Sync Error:', err);
    }
  };

  // Volunteer joins a green campaign
  const handleJoinCampaign = async (campaignId: string) => {
    let updatedCampaign: Campaign | null = null;
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId && !c.joined) {
          // Grant points immediately
          if (loggedInUser) {
            setLoggedInUser((prevUser) => prevUser ? { ...prevUser, points: prevUser.points + c.pointsReward } : null);
          }
          updatedCampaign = {
            ...c,
            volunteersCount: c.volunteersCount + 1,
            joined: true,
          };
          return updatedCampaign;
        }
        return c;
      })
    );

    try {
      if (supabaseStatus.isConnected && supabaseStatus.missingTables.length === 0 && updatedCampaign) {
        await updateSupabaseCampaign(campaignId, {
          volunteersCount: (updatedCampaign as Campaign).volunteersCount,
          joined: true
        });
        if (loggedInUser) {
          const campaignReward = (updatedCampaign as Campaign).pointsReward;
          await updateSupabaseUserPoints(loggedInUser.email, loggedInUser.points + campaignReward);
        }
      }
    } catch (err) {
      console.warn('Supabase Campaign Join Error:', err);
    }
  };

  // Admin empties / resets an IoT smart container
  const handleEmptyBin = async (binId: string) => {
    let updatedBin: SmartBin | null = null;
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          updatedBin = {
            ...b,
            fillLevel: 10,
            lastEmptied: new Date().toISOString().slice(0, 16).replace('T', ' '),
          };
          return updatedBin;
        }
        return b;
      })
    );

    try {
      if (supabaseStatus.isConnected && supabaseStatus.missingTables.length === 0 && updatedBin) {
        await updateSupabaseBin(binId, {
          fillLevel: 10,
          lastEmptied: (updatedBin as SmartBin).lastEmptied
        });
      }
    } catch (err) {
      console.warn('Supabase Bin Empty Error:', err);
    }
  };

  // Citizen simulation click to fill a bin (forces alerting system for testing)
  const handleEmptyMyBinSimulation = (binId: string) => {
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          return {
            ...b,
            fillLevel: Math.min(100, b.fillLevel + 35),
          };
        }
        return b;
      })
    );
  };

  // Create state refs so that our simulation interval loop can access fresh state values safely
  const trucksRef = React.useRef(trucks);
  const reportsRef = React.useRef(reports);
  const binsRef = React.useRef(bins);

  useEffect(() => {
    trucksRef.current = trucks;
  }, [trucks]);

  useEffect(() => {
    reportsRef.current = reports;
  }, [reports]);

  useEffect(() => {
    binsRef.current = bins;
  }, [bins]);

  // Admin dispatches a truck to a citizen's reported incident
  const handleDispatchTruck = async (truckId: string, reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    // Mark report as Dispatched
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'Dispatched' } : r))
    );

    let updatedTruck: Truck | null = null;
    // Update truck path and routing target
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.id === truckId) {
          updatedTruck = {
            ...t,
            status: 'En Route' as const,
            assignedReportId: reportId,
            speed: 40,
            route: [
              { x: t.location.x, y: t.location.y }, // current start node
              { x: report.location.x, y: report.location.y }, // target hotspot
              { x: 90, y: 90 }, // waste treatment center return node
            ],
            currentRouteIndex: 1,
          };

          // Trigger notifications for dispatch and route update
          triggerNotification(
            'Sanitation Dispatch',
            `Fleet ${t.plateNumber} (${t.driverName}) has been dispatched to coordinate (${report.location.x}, ${report.location.y}) for '${report.title}'.`,
            'info',
            'In-App',
            'Admin'
          );

          triggerNotification(
            'Truck En Route',
            `A collection truck is heading to your reported issue area at ${report.location.address}. Follow route updates on the live map!`,
            'info',
            'Push',
            report.reporterEmail
          );

          return updatedTruck;
        }
        return t;
      })
    );
    setHighlightedId(truckId);

    try {
      if (supabaseStatus.isConnected && supabaseStatus.missingTables.length === 0) {
        await updateSupabaseReport(reportId, { status: 'Dispatched' });
        if (updatedTruck) {
          await updateSupabaseTruck(truckId, {
            status: 'En Route',
            assignedReportId: reportId,
            speed: 40,
            route: (updatedTruck as Truck).route,
            currentRouteIndex: 1
          });
        }
      }
    } catch (err) {
      console.warn('Supabase Truck Dispatch sync failed:', err);
    }
  };

  // Directly resolve a report from administrative hub
  const handleResolveReportDirectly = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'Resolved' } : r))
    );

    if (report) {
      triggerNotification(
        'Incident Resolved',
        `Clean City Municipal Teams have resolved the issue '${report.title}' at ${report.location.address}. Thank you for keeping the city clean!`,
        'success',
        'In-App',
        'Admin'
      );

      triggerNotification(
        'Waste Hazard Cleared',
        `Great news! The reported incident '${report.title}' at ${report.location.address} has been successfully cleared and resolved by municipal teams. +50 Green Points validated.`,
        'success',
        'Email',
        report.reporterEmail
      );
    }

    try {
      if (supabaseStatus.isConnected && supabaseStatus.missingTables.length === 0) {
        await updateSupabaseReport(reportId, { status: 'Resolved' });
      }
    } catch (err) {
      console.warn('Supabase Direct Resolve sync failed:', err);
    }
  };

  // --- Real-time Tick Simulator Loop with live Notifications ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Access fresh state values from refs
      const currentTrucks = trucksRef.current;
      const currentReports = reportsRef.current;
      const currentBins = binsRef.current;

      // 1. Fill bins up gradually over time (simulate natural garbage accumulation)
      setBins((prevBins) =>
        prevBins.map((bin) => {
          // GENERAL and ORGANIC bins fill faster (+1.5% per tick), hazardous/e-waste fills slower
          const speedFactor = bin.type === 'General' || bin.type === 'Organic' ? 1.5 : 0.6;
          return {
            ...bin,
            fillLevel: Math.min(100, Math.round((bin.fillLevel + Math.random() * speedFactor) * 10) / 10),
          };
        })
      );

      // 2. Simulate random delays for en route trucks occasionally (approx 5% chance per tick)
      if (Math.random() < 0.08) {
        const activeEnRoute = currentTrucks.filter((t) => t.status === 'En Route');
        if (activeEnRoute.length > 0) {
          const randomTruck = activeEnRoute[Math.floor(Math.random() * activeEnRoute.length)];
          const associatedReport = currentReports.find((r) => r.id === randomTruck.assignedReportId);
          
          triggerNotification(
            'Fleet Route Delay',
            `Fleet ${randomTruck.plateNumber} is experiencing minor traffic congestion on Route Sector (${randomTruck.location.x}, ${randomTruck.location.y}). Delivery schedule slightly adjusted.`,
            'warning',
            'SMS',
            associatedReport ? associatedReport.reporterEmail : 'Admin'
          );
        }
      }

      // 3. Animate and update active Trucks along their routes
      setTrucks((prevTrucks) =>
        prevTrucks.map((truck) => {
          if (truck.status === 'Idle' || truck.route.length === 0) {
            return truck;
          }

          const target = truck.route[truck.currentRouteIndex];
          if (!target) {
            // Reached very end of entire route array (returned to waste treatment depot)
            if (truck.assignedReportId) {
              const repId = truck.assignedReportId;
              const associatedReport = currentReports.find((r) => r.id === repId);

              // Trigger resolution notifications
              if (associatedReport) {
                triggerNotification(
                  'Collection Completed',
                  `Fleet ${truck.plateNumber} completed clearing site and returned safely to Treatment Hub (90, 90). Sector (${associatedReport.location.x}, ${associatedReport.location.y}) is now clean.`,
                  'success',
                  'In-App',
                  'Admin'
                );

                triggerNotification(
                  'Cleaning Complete',
                  `Sanitation completed at ${associatedReport.location.address}! Our collection vehicle has fully cleared and processed the waste.`,
                  'success',
                  'Push',
                  associatedReport.reporterEmail
                );
              }

              // Resolve the report
              setReports((prevReps) =>
                prevReps.map((r) => (r.id === repId ? { ...r, status: 'Resolved' } : r))
              );

              return {
                ...truck,
                status: 'Idle' as const,
                assignedReportId: null,
                route: [{ x: truck.location.x, y: truck.location.y }],
                currentRouteIndex: 0,
                speed: 0,
                fillLevel: Math.min(100, truck.fillLevel + 25), // add load
              };
            }

            return {
              ...truck,
              status: 'Idle' as const,
              route: [{ x: truck.location.x, y: truck.location.y }],
              currentRouteIndex: 0,
              speed: 0,
            };
          }

          // Move closer to the current route target
          const dx = target.x - truck.location.x;
          const dy = target.y - truck.location.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const movementStep = 5.5; // step distance covered per simulation tick

          if (dist <= movementStep) {
            // Reached this intermediate node
            const nextIdx = truck.currentRouteIndex + 1;
            const reachedFinalHotspot = truck.assignedReportId && nextIdx === truck.route.length - 1;

            if (reachedFinalHotspot && truck.assignedReportId) {
              const associatedReport = currentReports.find((r) => r.id === truck.assignedReportId);
              if (associatedReport) {
                // Trigger arrival notification
                triggerNotification(
                  'Arrived at Hotspot',
                  `Fleet ${truck.plateNumber} has arrived at Sector (${associatedReport.location.x}, ${associatedReport.location.y}). Sweepers starting cleanup operations.`,
                  'info',
                  'In-App',
                  'Admin'
                );
                
                triggerNotification(
                  'Cleanup Commencing',
                  `Our cleaning crew has arrived at ${associatedReport.location.address}. Operations are actively underway to clear the hazard.`,
                  'info',
                  'SMS',
                  associatedReport.reporterEmail
                );
              }
            }

            return {
              ...truck,
              location: target,
              currentRouteIndex: nextIdx,
              status: reachedFinalHotspot ? ('Collecting' as const) : truck.status,
            };
          } else {
            // Interpolate toward destination
            const ratio = movementStep / dist;
            return {
              ...truck,
              location: {
                x: Math.round((truck.location.x + dx * ratio) * 10) / 10,
                y: Math.round((truck.location.y + dy * ratio) * 10) / 10,
              },
            };
          }
        })
      );

      // 4. Automated truck empty check (if an active truck moves within 6 units of a full Smart Bin, empty the bin!)
      setTrucks((currentTrucksList) => {
        currentTrucksList.forEach((truck) => {
          if (truck.status !== 'Idle') {
            setBins((prevBins) =>
              prevBins.map((bin) => {
                const distanceVal = Math.sqrt(
                  Math.pow(bin.location.x - truck.location.x, 2) + Math.pow(bin.location.y - truck.location.y, 2)
                );
                if (distanceVal < 6 && bin.fillLevel >= 75) {
                  // Trigger bin empty notification
                  triggerNotification(
                    'Smart Bin Cleared',
                    `Automated cleanup: Fleet truck bypassed Smart Bin ${bin.name} at (${bin.location.x}, ${bin.location.y}) and emptied it. Capacity reset.`,
                    'success',
                    'In-App',
                    'Admin'
                  );

                  return {
                    ...bin,
                    fillLevel: 10,
                    lastEmptied: new Date().toISOString().slice(0, 16).replace('T', ' '),
                  };
                }
                return bin;
              })
            );
          }
        });
        return currentTrucksList;
      });

    }, 3000); // simulation interval runs every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialization & Boot sequence animation
  useEffect(() => {
    const logs = [
      'STABILIZING SYSTEM SECURE SHIELD ACTIVE...',
      'ESTABLISHING ENCRYPTED CLOUD DATA INTERFACE...',
      'DECRYPTING COGNITIVE SIMULATIVE TELEMETRY...',
      'SYNCHRONIZING IOT SMART RECEPTACLE SOCKETS...',
      'COMMENCING ANTIVIRUS MALWARE HEURISTIC DAEMON...',
      'INTEGRITY VERIFIED. PRODUCTION SYSTEM SHIELD ONLINE.'
    ];

    let currentLogIdx = 0;
    const interval = setInterval(() => {
      setInitProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsInitializing(false);
          }, 600);
          return 100;
        }
        
        // Add log lines matching progress percentage thresholds
        const step = Math.floor(prev / 17);
        if (step > currentLogIdx && step < logs.length) {
          currentLogIdx = step;
          setInitLogs(l => [...l, `[ OK ] ${logs[step]}`]);
        }

        return prev + 2;
      });
    }, 40); // ~2 seconds complete boot

    setInitLogs([`[ START ] BOOT SEQUENCE ENFORCED. PRODUCTION PROTOCOLS ENFORCED`]);

    return () => clearInterval(interval);
  }, []);

  // Helper to clear notifications
  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Helper to mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div id="app-root-shell" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden scanline">
      {/* Dynamic 3D cybernetic node network background */}
      <ThreeDBackground />

      {/* Fullscreen Boot Loader Sequence */}
      {isInitializing && (
        <div id="boot-loader-screen" className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center font-mono p-4 text-xs select-none">
          {/* Neon Scanner overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-1/4 w-full animate-laser border-y border-emerald-500/10 pointer-events-none"></div>
          
          <div className="w-full max-w-lg space-y-6 bg-slate-900/60 p-8 rounded-3xl border border-emerald-500/20 backdrop-blur-md shadow-[0_0_50px_rgba(16,185,129,0.15)] relative">
            <div className="flex items-center gap-4">
              <Logo size="lg" showText={false} />
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 tracking-widest font-bold block uppercase">SECURE PRODUCTION STATE</span>
                <h1 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">CLEAN CITY MUNICIPAL OS v4.0</h1>
              </div>
            </div>

            {/* Boot Logs */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-40 overflow-y-auto space-y-2 text-[10px] text-slate-400 scrollbar-thin">
              {initLogs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-emerald-500">[{new Date().toTimeString().split(' ')[0]}]</span>
                  <span className="text-slate-300 leading-normal">{log}</span>
                </div>
              ))}
              <div className="text-emerald-400/80 animate-pulse">
                &gt; SYSTEM BOOT LOADER WORKING: {initProgress}%
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>VERIFYING CRYPTOGRAPHIC HANDSHAKE</span>
                <span>{initProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                <div 
                  className="bg-emerald-400 h-2 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-all duration-75"
                  style={{ width: `${initProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center text-[9px] text-slate-500 uppercase tracking-widest pt-2">
              TLS 1.3 Secure Handshake • AES-256 Cloud DB Sync
            </div>
          </div>
        </div>
      )}

      {/* Visual Overlay Texture from Immersive UI */}
      <div className="noise-overlay"></div>

      {/* Global Navigation Header */}
      <header id="global-header" className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-emerald-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('landing')}>
            <Logo size="sm" />
          </div>

          {/* Navigation Segments styled with cybernetic glows */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-emerald-500/10">
            <button
              onClick={() => setCurrentTab('landing')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'landing' 
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/30'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentTab('map')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'map' 
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/30'
              }`}
            >
              3D Live Tracker
            </button>
            <button
              onClick={() => setCurrentTab('hub')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'hub' 
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/30'
              }`}
            >
              Cooperation Hub
            </button>
            <button
              onClick={() => setCurrentTab('complaint')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'complaint' 
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/30'
              }`}
            >
              Register Complaint
            </button>
            <button
              onClick={() => setCurrentTab('portal')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'portal'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/30'
              }`}
            >
              {loggedInUser ? `${loggedInUser.role === 'admin' ? 'Admin' : 'Citizen'} Desk` : 'Access Portal'}
            </button>
          </nav>

          {/* Header Widgets / Notifications / User Widget */}
          <div className="flex items-center gap-3">
            {/* Supabase status drawer toggle */}
            <button
              onClick={() => setShowDbStatus(!showDbStatus)}
              className={`relative p-2 bg-slate-900 border rounded-lg transition-all hover:bg-slate-850 cursor-pointer ${
                supabaseStatus.isConnected && supabaseStatus.missingTables.length === 0
                  ? 'border-emerald-500/20 text-emerald-400 hover:border-emerald-500/50'
                  : 'border-amber-500/30 text-amber-400 hover:border-amber-500/60'
              }`}
              title="Supabase Database Status"
            >
              <Database className="w-4 h-4" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${
                supabaseStatus.isConnected && supabaseStatus.missingTables.length === 0
                  ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                  : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
              }`}></span>
            </button>

            {/* Real-Time Notification Bell */}
            <button
              id="notification-bell-btn"
              onClick={() => {
                setShowNotificationCenter(!showNotificationCenter);
                handleMarkAllRead();
              }}
              className="relative p-2 bg-slate-900 border border-emerald-500/20 text-slate-350 hover:text-emerald-400 hover:border-emerald-500/50 rounded-lg transition-all hover:bg-slate-850 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-slate-950 font-mono font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {loggedInUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-100 tracking-tight">{loggedInUser.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                    {loggedInUser.role === 'admin' ? 'Administrator' : `Citizen | ${loggedInUser.points} GP`}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 bg-slate-900 border border-emerald-500/20 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 rounded-lg transition-all hover:bg-slate-850 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('portal')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-neon-emerald"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Floating Supabase status panel widget */}
      {showDbStatus && (
        <div className="fixed top-18 right-4 z-50 animate-fadeIn max-w-[calc(100vw-2rem)]">
          <SupabaseStatusPanel 
            status={supabaseStatus} 
            onRefresh={triggerDbRefresh} 
          />
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Navigation Screen Dispatcher */}
        {currentTab === 'landing' && (
          <LandingHero
            onNavigate={(tab) => setCurrentTab(tab)}
            cityCleanlinessIndex={cityCleanlinessIndex}
          />
        )}

        {currentTab === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-100">City Telemetry & 3D Logistics</h2>
                <p className="text-slate-400 text-xs">
                  Interact with the rotated 3D grid layout. Check smart container thresholds and follow live vehicle paths.
                </p>
              </div>

              {/* Legend Summary Indicators */}
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                <div className="bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg">
                  Cleanliness Score: <strong className="text-emerald-400">{cityCleanlinessIndex}%</strong>
                </div>
                <div className="bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg">
                  Critical Bins: <strong className="text-amber-400">{bins.filter(b => b.fillLevel >= 80).length}</strong>
                </div>
              </div>
            </div>

            {/* Interactive City 3D Map Grid */}
            <CityMap
              bins={bins}
              trucks={trucks}
              reports={reports}
              highlightedId={highlightedId}
              onSelectBin={(bin) => {
                setHighlightedId(bin.id);
              }}
              onSelectTruck={(truck) => {
                setHighlightedId(truck.id);
              }}
              onSelectReport={(rep) => {
                setHighlightedId(rep.id);
              }}
            />

            {/* Help Guideline Banner */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-400">
              <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-slate-200">Interactive Telemetry Help:</strong>
                <p className="leading-relaxed">
                  Use the control dials on the bottom right of the map to **rotate, tilt, and zoom** the 3D grid to see the buildings from different angles. Hover over active map pins to check details. If you log in to your account, you will unlock full command dashboards to interact directly with these assets in real-time.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'hub' && (
          <MunicipalHub
            campaigns={campaigns}
            onJoinCampaign={handleJoinCampaign}
            currentUserPoints={loggedInUser ? loggedInUser.points : 0}
          />
        )}

        {currentTab === 'complaint' && (
          <RegisterComplaint
            reports={reports}
            loggedInUser={loggedInUser}
            onAddReport={handleAddReport}
            onUpvoteReport={handleUpvoteReport}
            bins={bins}
          />
        )}

        {currentTab === 'portal' && (
          <>
            {loggedInUser ? (
              loggedInUser.role === 'admin' ? (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-2xl font-extrabold text-slate-100">Municipal Administration Control Center</h2>
                    <p className="text-slate-400 text-xs">Authorize cleanups, reset smart bins, and manage fleet routes directly.</p>
                  </div>
                  <AdminDashboard
                    bins={bins}
                    trucks={trucks}
                    reports={reports}
                    onEmptyBin={handleEmptyBin}
                    onDispatchTruck={handleDispatchTruck}
                    onResolveReportDirectly={handleResolveReportDirectly}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-2xl font-extrabold text-slate-100">Citizen Clean-Up Command Desk</h2>
                    <p className="text-slate-400 text-xs">Submit active waste logs, coordinate with neighborhoods, and redeem green points.</p>
                  </div>
                  <PublicDashboard
                    reports={reports}
                    bins={bins}
                    trucks={trucks}
                    currentUserEmail={loggedInUser.email}
                    currentUserName={loggedInUser.name}
                    currentUserPoints={loggedInUser.points}
                    onAddReport={handleAddReport}
                    onUpvoteReport={handleUpvoteReport}
                    onEmptyMyBinSimulation={handleEmptyMyBinSimulation}
                  />
                </div>
              )
            ) : (
              <PortalAuth 
                onLogin={handleLogin} 
                reports={reports}
                bins={bins}
                trucks={trucks}
              />
            )}
          </>
        )}
      </main>

      {/* --- NOTIFICATION CENTER DRAWER --- */}
      {showNotificationCenter && (
        <div id="notification-drawer" className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-950/95 backdrop-blur-md border-l border-emerald-500/30 z-50 shadow-2xl flex flex-col animate-slideLeft">
          <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Live Route Alerts</h3>
            </div>
            <button
              onClick={() => setShowNotificationCenter(false)}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-[10px] text-slate-400 font-mono">LOG DECK: {notifications.length} EVENTS</span>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearNotifications}
                  className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-center text-slate-500 text-xs">
                No active notifications in transit queue.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border flex flex-col gap-1 text-xs transition-colors duration-200 ${
                    n.type === 'success'
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                      : n.type === 'warning'
                      ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                      : n.type === 'alert'
                      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">{n.title}</span>
                    <span className="text-[9px] font-mono text-slate-500">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-350 leading-relaxed text-[11px]">{n.message}</p>
                  
                  <div className="mt-1.5 pt-1.5 border-t border-slate-900/40 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Channel: <strong className="text-slate-400">{n.channel}</strong>
                    </span>
                    <span>To: {n.recipient === 'Admin' ? 'Admin Terminal' : n.recipient}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-slate-900/60 border-t border-emerald-500/10 text-center text-[10px] text-slate-500">
            System triggers push, SMS, and Email channels dynamically in background workers.
          </div>
        </div>
      )}

      {/* --- FLOATING REAL-TIME SYSTEM NOTIFICATION TOAST --- */}
      {toast && (
        <div id="live-notification-toast" className="fixed bottom-6 left-6 z-50 max-w-sm bg-slate-950 border border-emerald-400 p-4 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-slideRight space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'warning' ? 'bg-amber-400' : toast.type === 'alert' ? 'bg-rose-500 animate-ping' : 'bg-blue-400'
              }`}></span>
              <strong className="text-xs font-bold text-slate-100 uppercase tracking-wider">{toast.title}</strong>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono border-t border-slate-900 pt-1.5">
            <span>📡 Mode: {toast.channel} Alert</span>
            <span>{toast.timestamp}</span>
          </div>
        </div>
      )}

      {/* --- FLOATING SMART CITY COORDINATOR CHATBOT OVERLAY --- */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {showAIChat && (
          <div id="ai-chat-window" className="w-[340px] sm:w-[400px] h-[480px] bg-slate-950/95 backdrop-blur-md border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-scaleUp">
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">Clean City Coordinator</h4>
                  <p className="text-[9px] text-emerald-400 font-mono">Gemini-Powered AI Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Thread */}
            <AIChatBox />
          </div>
        )}

        {/* Bubble Button */}
        <button
          id="ai-floating-widget-btn"
          onClick={() => setShowAIChat(!showAIChat)}
          className={`w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer transition-all hover:scale-105 ${
            showAIChat ? 'rotate-90' : ''
          }`}
          title="Speak to Clean City AI Coordinator"
        >
          {showAIChat ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      {/* Footer Branding */}
      <footer id="global-footer" className="bg-slate-950 border-t border-slate-900 text-center py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-semibold text-slate-400">© 2026 Clean City Municipal Systems. All rights reserved.</p>
          <p className="max-w-xl mx-auto leading-relaxed">
            In collaboration with the Regional Waste Management Directorate and the Department of Urban Sanitation. Powered by advanced IoT telemetry and automated route planning.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Sub-component: AI Chat interface box in App.tsx
function AIChatBox() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    {
      sender: 'assistant',
      text: "Greetings, Citizen! I am the Clean City Smart Coordinator. I can assist you with recycling questions, explain how to lodge reports on our 3D tracking map, or show you how our collection vehicles process telemetry alerts. What can I do for you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll chat thread to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Map frontend messages into the structured Content model required by Gemini SDK on the server:
      // Content has form: { role: 'user' | 'model', parts: [{ text: string }] }
      const formattedHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg,
          history: formattedHistory
        })
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'assistant', text: data.text || 'I was unable to complete this query.' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'assistant', text: 'Apologies, but the cybernetic neural link is experiencing minor interference. Please try again in a few moments.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-grow overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'self-end ml-auto items-end' : 'self-start items-start'
            }`}
          >
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">
              {msg.sender === 'user' ? 'You' : 'Eco Coordinator'}
            </span>
            <div
              className={`p-3 rounded-2xl leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900 text-slate-200 border border-emerald-500/10 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col max-w-[85%] self-start items-start">
            <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold animate-pulse mb-1">
              Analyzing telemetry...
            </span>
            <div className="p-3.5 bg-slate-900 text-slate-400 border border-emerald-500/10 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/80 border-t border-emerald-500/10 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about segregation, GP rewards..."
          disabled={loading}
          className="flex-grow bg-slate-950 border border-emerald-500/15 focus:border-emerald-400 text-slate-200 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 rounded-xl transition-all cursor-pointer shadow-neon-emerald-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </>
  );
}

