import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const fallbackSupabaseUrl = 'https://placeholder.supabase.co';
const fallbackSupabaseAnonKey = 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Anon Key missing in .env. Running in offline UI mode.');
}

export const supabase = createClient<Database>(
  supabaseUrl || fallbackSupabaseUrl,
  supabaseAnonKey || fallbackSupabaseAnonKey,
  {
    auth: {
      autoRefreshToken: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
    },
  }
);

// Helper function to log activity site-wide
export const logActivity = async (action: string, details: string, email?: string) => {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase.from('site_logs').insert([{
      action,
      details,
      user_email: email || 'system',
      created_at: new Date().toISOString()
    }]);
    if (error) console.error('Logging failed:', error);
  } catch (err) {
    console.error('Logging exception:', err);
  }
};
