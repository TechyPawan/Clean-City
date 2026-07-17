import { supabase } from './supabaseClient';
import { SmartBin, Truck, Report, Campaign, User } from './types';
import { INITIAL_BINS, INITIAL_TRUCKS, INITIAL_REPORTS, INITIAL_CAMPAIGNS } from './mockData';

export interface SupabaseConfigState {
  isConnected: boolean;
  missingTables: string[];
  errorMessage: string | null;
}

// Check if a table exists by attempting a limit 1 query
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    if (error) {
      // Postgres error code for "relation does not exist" is usually PGRST116, 42P01, etc.
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function verifySupabaseConnection(): Promise<SupabaseConfigState> {
  const state: SupabaseConfigState = {
    isConnected: false,
    missingTables: [],
    errorMessage: null
  };

  try {
    const tables = ['reports', 'bins', 'trucks', 'campaigns', 'users'];
    const checks = await Promise.all(tables.map(t => checkTableExists(t)));
    
    tables.forEach((table, idx) => {
      if (!checks[idx]) {
        state.missingTables.push(table);
      }
    });

    state.isConnected = true;
  } catch (err: any) {
    state.errorMessage = err.message || 'Unknown connection error';
  }

  return state;
}

// ---------------- REPORTS OPERATIONS ----------------
export async function getSupabaseReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('createdAt', { ascending: false });
  
  if (error) throw error;
  
  // Parse JSONB fields
  return (data || []).map((row: any) => ({
    ...row,
    location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
    upvotedBy: typeof row.upvotedBy === 'string' ? JSON.parse(row.upvotedBy) : (row.upvotedBy || [])
  }));
}

export async function insertSupabaseReport(report: Report): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .insert([report]);
  if (error) throw error;
}

export async function updateSupabaseReport(id: string, updates: Partial<Report>): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

// ---------------- BINS OPERATIONS ----------------
export async function getSupabaseBins(): Promise<SmartBin[]> {
  const { data, error } = await supabase
    .from('bins')
    .select('*')
    .order('name');
  
  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row,
    location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location
  }));
}

export async function updateSupabaseBin(id: string, updates: Partial<SmartBin>): Promise<void> {
  const { error } = await supabase
    .from('bins')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function bulkInsertBins(bins: SmartBin[]): Promise<void> {
  const { error } = await supabase.from('bins').insert(bins);
  if (error) throw error;
}

// ---------------- TRUCKS OPERATIONS ----------------
export async function getSupabaseTrucks(): Promise<Truck[]> {
  const { data, error } = await supabase
    .from('trucks')
    .select('*')
    .order('plateNumber');
  
  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row,
    location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
    route: typeof row.route === 'string' ? JSON.parse(row.route) : (row.route || [])
  }));
}

export async function updateSupabaseTruck(id: string, updates: Partial<Truck>): Promise<void> {
  const { error } = await supabase
    .from('trucks')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function bulkInsertTrucks(trucks: Truck[]): Promise<void> {
  const { error } = await supabase.from('trucks').insert(trucks);
  if (error) throw error;
}

// ---------------- CAMPAIGNS OPERATIONS ----------------
export async function getSupabaseCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('date');
  
  if (error) throw error;
  return data || [];
}

export async function updateSupabaseCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
  const { error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function bulkInsertCampaigns(campaigns: Campaign[]): Promise<void> {
  const { error } = await supabase.from('campaigns').insert(campaigns);
  if (error) throw error;
}

// ---------------- USER OPERATIONS ----------------
export async function getSupabaseUser(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function upsertSupabaseUser(user: User): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'email' });
  if (error) throw error;
}

export async function updateSupabaseUserPoints(email: string, points: number): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ points })
    .eq('email', email);
  if (error) throw error;
}

// ---------------- SEED DATABASE FUNCTION ----------------
export async function seedSupabaseDatabase(): Promise<void> {
  try {
    const reportsCount = await supabase.from('reports').select('id', { count: 'exact', head: true });
    if (reportsCount.count === 0) {
      await supabase.from('reports').insert(INITIAL_REPORTS);
    }

    const binsCount = await supabase.from('bins').select('id', { count: 'exact', head: true });
    if (binsCount.count === 0) {
      await supabase.from('bins').insert(INITIAL_BINS);
    }

    const trucksCount = await supabase.from('trucks').select('id', { count: 'exact', head: true });
    if (trucksCount.count === 0) {
      await supabase.from('trucks').insert(INITIAL_TRUCKS);
    }

    const campaignsCount = await supabase.from('campaigns').select('id', { count: 'exact', head: true });
    if (campaignsCount.count === 0) {
      await supabase.from('campaigns').insert(INITIAL_CAMPAIGNS);
    }
  } catch (err) {
    console.warn('Seeding failed (perhaps tables are not created yet):', err);
  }
}

export const SQL_SETUP_SCRIPT = `-- ==========================================
-- CLEAN CITY MUNICIPAL DATABASE SETUP SCRIPT
-- Copy and run this script in your Supabase SQL Editor
-- ==========================================

-- 1. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    urgency TEXT NOT NULL,
    location JSONB NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterEmail" TEXT NOT NULL,
    status TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    upvotes INT8 DEFAULT 0,
    "upvotedBy" JSONB DEFAULT '[]'::jsonb,
    "photoUrl" TEXT,
    "assignedOrg" TEXT,
    "wastageArea" TEXT,
    "wastageVolume" TEXT
);

-- 2. Create Smart Bins Table
CREATE TABLE IF NOT EXISTS public.bins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location JSONB NOT NULL,
    "fillLevel" FLOAT8 NOT NULL,
    type TEXT NOT NULL,
    "lastEmptied" TEXT NOT NULL
);

-- 3. Create Fleet Trucks Table
CREATE TABLE IF NOT EXISTS public.trucks (
    id TEXT PRIMARY KEY,
    "plateNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    status TEXT NOT NULL,
    "fillLevel" FLOAT8 NOT NULL,
    location JSONB NOT NULL,
    route JSONB NOT NULL,
    "currentRouteIndex" INT8 DEFAULT 0,
    "assignedReportId" TEXT,
    speed FLOAT8 DEFAULT 0
);

-- 4. Create campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    organizer TEXT NOT NULL,
    location TEXT NOT NULL,
    "volunteersCount" INT8 DEFAULT 0,
    "maxVolunteers" INT8 NOT NULL,
    joined BOOLEAN DEFAULT false,
    status TEXT NOT NULL,
    "pointsReward" INT8 NOT NULL
);

-- 5. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    points INT8 DEFAULT 120
);

-- Enable Row Level Security (RLS) for sandbox security settings
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create direct public-access security policy profiles (simplifies testing)
CREATE POLICY "Allow public select on reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on reports" ON public.reports FOR UPDATE USING (true);

CREATE POLICY "Allow public select on bins" ON public.bins FOR SELECT USING (true);
CREATE POLICY "Allow public insert on bins" ON public.bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on bins" ON public.bins FOR UPDATE USING (true);

CREATE POLICY "Allow public select on trucks" ON public.trucks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on trucks" ON public.trucks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on trucks" ON public.trucks FOR UPDATE USING (true);

CREATE POLICY "Allow public select on campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public insert on campaigns" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on campaigns" ON public.campaigns FOR UPDATE USING (true);

CREATE POLICY "Allow public select on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON public.users FOR UPDATE USING (true);
`;
