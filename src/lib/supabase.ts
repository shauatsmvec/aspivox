import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key missing in .env');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Helper function to log activity site-wide
export const logActivity = async (action: string, details: string, email?: string) => {
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
