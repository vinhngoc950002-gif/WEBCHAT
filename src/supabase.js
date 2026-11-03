import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const onlineEnabled = Boolean(url && key && !url.includes('YOUR_PROJECT') && !key.startsWith('YOUR_'));
export const supabase = onlineEnabled ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
