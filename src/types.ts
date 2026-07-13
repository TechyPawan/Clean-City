export type UserRole = 'public' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number; // Citizens earn points for reporting & recycling!
}

export type WasteCategory = 'Organic' | 'Plastic' | 'Hazardous' | 'E-Waste' | 'General' | 'Overflowing Bin' | 'Illegal Dumping';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportStatus = 'Pending' | 'Dispatched' | 'Resolved';

export interface Report {
  id: string;
  title: string;
  description: string;
  category: WasteCategory;
  urgency: UrgencyLevel;
  location: {
    x: number;
    y: number;
    address: string;
  };
  reporterName: string;
  reporterEmail: string;
  status: ReportStatus;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[]; // List of user emails who upvoted
  photoUrl?: string; // Optional user uploaded photo URL or base64 data
  assignedOrg?: string; // Government organization the issue is routed to
  wastageArea?: string; // e.g. "Medium Area (10-25 sq meters)"
  wastageVolume?: string; // e.g. "Full truck load"
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  channel: 'In-App' | 'Push' | 'SMS' | 'Email';
  recipient: string; // 'Admin' or user's email
  read: boolean;
}

export type BinType = 'Recycling' | 'Organic' | 'General' | 'Hazardous' | 'E-Waste';

export interface SmartBin {
  id: string;
  name: string;
  location: {
    x: number;
    y: number;
    address: string;
  };
  fillLevel: number; // Percentage 0 - 100
  type: BinType;
  lastEmptied: string;
}

export type TruckStatus = 'Idle' | 'En Route' | 'Collecting' | 'At Capacity';

export interface Truck {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  status: TruckStatus;
  fillLevel: number; // Percentage 0 - 100
  location: {
    x: number;
    y: number;
  };
  route: { x: number; y: number }[];
  currentRouteIndex: number;
  assignedReportId: string | null;
  speed: number; // km/h
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  organizer: string;
  location: string;
  volunteersCount: number;
  maxVolunteers: number;
  joined: boolean;
  status: 'Upcoming' | 'Active' | 'Completed';
  pointsReward: number;
}
