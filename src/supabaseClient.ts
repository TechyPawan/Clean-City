import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};

const defaultUrl = 'https://phptqjwvgxskvqtahyxm.supabase.co';
const defaultKey = 'sb_publishable_X1EBzRTxc4jnLiVCDL0Uvg_MOVA7JgI';

const isValidUrl = (url: any): boolean => {
  if (typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

const supabaseUrl = isValidUrl(env.VITE_SUPABASE_URL) ? env.VITE_SUPABASE_URL : defaultUrl;
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY && typeof env.VITE_SUPABASE_ANON_KEY === 'string' && env.VITE_SUPABASE_ANON_KEY.trim() !== '') 
  ? env.VITE_SUPABASE_ANON_KEY 
  : defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

