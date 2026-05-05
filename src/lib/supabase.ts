import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Initializing Supabase client...');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url') {
  console.error('CRITICAL: Supabase URL or Anon Key is missing! Check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)

// Debug: Expose to console
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

// Simple connection check
supabase.from('courses').select('id', { count: 'exact', head: true }).then(({ error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error.message);
  } else {
    console.log('Supabase connection test successful.');
  }
});
