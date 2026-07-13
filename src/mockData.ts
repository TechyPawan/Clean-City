import { SmartBin, Truck, Report, Campaign } from './types';

export const INITIAL_BINS: SmartBin[] = [
  {
    id: 'bin-1',
    name: 'Downtown Plaza Bin',
    type: 'General',
    location: { x: 30, y: 25, address: '124 Market Street (Corner of 4th Ave)' },
    fillLevel: 85,
    lastEmptied: '2026-07-12 18:30',
  },
  {
    id: 'bin-2',
    name: 'Central Park East Eco-Station',
    type: 'Recycling',
    location: { x: 55, y: 20, address: 'Central Park, Near Botanical Gardens Entry' },
    fillLevel: 34,
    lastEmptied: '2026-07-13 06:15',
  },
  {
    id: 'bin-3',
    name: 'Civic Center Hazard Box',
    type: 'Hazardous',
    location: { x: 45, y: 60, address: 'Civic Square, Behind City Hall Annex' },
    fillLevel: 92,
    lastEmptied: '2026-07-11 11:00',
  },
  {
    id: 'bin-4',
    name: 'Industrial Zone Smart Hub',
    type: 'E-Waste',
    location: { x: 80, y: 75, address: '88 Factory Blvd (Tech Park gate)' },
    fillLevel: 15,
    lastEmptied: '2026-07-13 05:00',
  },
  {
    id: 'bin-5',
    name: 'Metro Transit Terminal',
    type: 'General',
    location: { x: 25, y: 70, address: 'Metro Station Entrance, West Terminal' },
    fillLevel: 78,
    lastEmptied: '2026-07-13 01:20',
  },
  {
    id: 'bin-6',
    name: 'University Boulevard Station',
    type: 'Recycling',
    location: { x: 70, y: 35, address: 'University Blvd & Science Drive Intersection' },
    fillLevel: 48,
    lastEmptied: '2026-07-12 21:10',
  },
  {
    id: 'bin-7',
    name: 'Suburban Community Center',
    type: 'Organic',
    location: { x: 15, y: 45, address: '45 Orchard Lane (Community Hall Parking)' },
    fillLevel: 96,
    lastEmptied: '2026-07-12 14:00',
  },
  {
    id: 'bin-8',
    name: 'Riverside Walkway Bin',
    type: 'Organic',
    location: { x: 60, y: 80, address: 'Riverside Promenade (Near Dock 4)' },
    fillLevel: 12,
    lastEmptied: '2026-07-13 04:30',
  }
];

export const INITIAL_TRUCKS: Truck[] = [
  {
    id: 'truck-1',
    plateNumber: 'TX-892-CLEAN',
    driverName: 'Robert Vance',
    driverPhone: '+1 (555) 902-1243',
    status: 'En Route',
    fillLevel: 45,
    location: { x: 10, y: 10 },
    route: [
      { x: 10, y: 10 },
      { x: 15, y: 45 }, // Heading toward Bin 7 (Organic, 96%)
      { x: 30, y: 25 }, // Then Bin 1 (General, 85%)
      { x: 25, y: 70 }, // Then Bin 5 (General, 78%)
      { x: 10, y: 10 }  // Back to Depot
    ],
    currentRouteIndex: 0,
    assignedReportId: null,
    speed: 35,
  },
  {
    id: 'truck-2',
    plateNumber: 'TX-431-ECO',
    driverName: 'Sarah Jenkins',
    driverPhone: '+1 (555) 321-4566',
    status: 'Collecting',
    fillLevel: 68,
    location: { x: 45, y: 60 }, // Currently at Bin 3 (Hazardous, 92%)
    route: [
      { x: 45, y: 60 }, // Bin 3
      { x: 70, y: 35 }, // Bin 6
      { x: 80, y: 75 }, // Bin 4
      { x: 90, y: 90 }, // Waste Center Depot
      { x: 45, y: 60 }
    ],
    currentRouteIndex: 0,
    assignedReportId: null,
    speed: 0,
  },
  {
    id: 'truck-3',
    plateNumber: 'TX-705-DISPATCH',
    driverName: 'Marcus Brooks',
    driverPhone: '+1 (555) 887-2309',
    status: 'Idle',
    fillLevel: 10,
    location: { x: 90, y: 90 }, // At main environmental facility
    route: [
      { x: 90, y: 90 }
    ],
    currentRouteIndex: 0,
    assignedReportId: null,
    speed: 0,
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-101',
    title: 'Overflowing Plastic Waste behind Market',
    description: 'Bulk packaging cardboard and plastic wraps are thrown behind the wholesale market entrance, blocking the pedestrian pathway and attracting rodents.',
    category: 'Plastic',
    urgency: 'High',
    location: { x: 32, y: 27, address: 'Rear alleyway of Downtown Market Plaza' },
    reporterName: 'Arjun Mehta',
    reporterEmail: 'arjun.mehta@gmail.com',
    status: 'Pending',
    createdAt: '2026-07-13 08:30',
    upvotes: 18,
    upvotedBy: ['citizen1@gmail.com', 'citizen2@gmail.com'],
    assignedOrg: 'Municipal Recycling Authority',
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'rep-102',
    title: 'Discarded Electronics in Canal',
    description: 'Two old computer CRT monitors and multiple battery packs have been dumped near the canal bank, which might cause toxic leaks in the water supply.',
    category: 'Hazardous',
    urgency: 'Critical',
    location: { x: 62, y: 82, address: 'Canal Bank, 20 meters west of Riverside Promenade Dock 4' },
    reporterName: 'Clara Oswald',
    reporterEmail: 'clara.o@outlook.com',
    status: 'Dispatched',
    createdAt: '2026-07-13 09:15',
    upvotes: 35,
    upvotedBy: ['citizen3@gmail.com', 'citizen4@gmail.com', 'citizen5@gmail.com'],
    assignedOrg: 'State Environmental Protection Agency (EPA)',
    photoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'rep-103',
    title: 'Construction Debris on Sidewalk',
    description: 'Broken concrete blocks and wooden pallets left on the main walking lane near the university entrance.',
    category: 'General',
    urgency: 'Medium',
    location: { x: 68, y: 38, address: 'University Blvd, opposite Science Block Gate' },
    reporterName: 'Dr. Evelyn Foster',
    reporterEmail: 'efoster@univ.edu',
    status: 'Resolved',
    createdAt: '2026-07-12 11:20',
    upvotes: 8,
    upvotedBy: ['citizen1@gmail.com'],
    assignedOrg: 'District Sanitation Department',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600',
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Global Recycling Awareness Week Drive',
    description: 'Join local municipal staff to distribute multi-colored recycling smart bins to families and teach standard segregation principles in residential blocks.',
    date: '2026-07-18',
    time: '09:00 - 13:00',
    organizer: 'Municipal Environmental Directorate & EcoGreen NGO',
    location: 'Downtown Public Square and Town Hall Entrance',
    volunteersCount: 42,
    maxVolunteers: 100,
    joined: false,
    status: 'Upcoming',
    pointsReward: 150,
  },
  {
    id: 'camp-2',
    title: 'Riverside Waterfront Clean-up',
    description: 'Let\'s gather to clean the plastic deposits and organic weed overgrowth from the central Riverside Promenade, backed by safety gear provided by the Sanitation Ministry.',
    date: '2026-07-15',
    time: '07:30 - 11:30',
    organizer: 'Department of Urban Sanitation & Waterways Authority',
    location: 'Riverside Walkway Dock 4 Assembly Point',
    volunteersCount: 88,
    maxVolunteers: 150,
    joined: false,
    status: 'Upcoming',
    pointsReward: 200,
  },
  {
    id: 'camp-3',
    title: 'E-Waste Segregation & Safe Recycling Seminar',
    description: 'A training drive to collect obsolete personal technology and batteries safely. Municipal experts will explain the hazardous materials in heavy electronics and provide certified drop-offs.',
    date: '2026-07-13',
    time: '14:00 - 16:30',
    organizer: 'State Pollution Control Board & TechRecycle Corp',
    location: 'Industrial Zone Tech Park Auditorium 3',
    volunteersCount: 60,
    maxVolunteers: 60,
    joined: true,
    status: 'Active',
    pointsReward: 100,
  }
];
