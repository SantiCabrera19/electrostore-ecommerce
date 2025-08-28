import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Get the correct redirect URL for auth callbacks
 */
export function getAuthRedirectUrl() {
  if (typeof window !== 'undefined') {
    // Client side - use current origin
    return `${window.location.origin}/auth/callback`
  }
  
  // Server side - use environment variable or default
  return process.env.NODE_ENV === 'production' 
    ? 'https://electrostore-ecommerce.vercel.app/auth/callback'
    : 'http://localhost:3000/auth/callback'
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

let browserSupabase: ReturnType<typeof createClient<Database>>

/**
 * Create a Supabase client for use in the browser
 */
export function createBrowserClient() {
  if (!browserSupabase) {
    browserSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return browserSupabase
}

/**
 * Create a Supabase client for use in server components
 */
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
};