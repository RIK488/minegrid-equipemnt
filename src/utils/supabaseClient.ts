// @ts-ignore
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Configuration pour éviter les erreurs TypeScript
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.x'
    }
  }
});

// Types pour éviter les erreurs de typage
export type Database = {
  public: {
    Tables: {
      [key: string]: any
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      [key: string]: any
    }
  }
}

// Export par défaut pour la compatibilité
export default supabaseClient;
