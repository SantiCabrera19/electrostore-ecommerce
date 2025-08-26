import { createServerClient } from './supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user from Supabase Auth
 * For use in Server Components
 */
export async function getCurrentUser() {
  const supabase = createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  return session?.user || null;
}

/**
 * Check if the current user is authenticated
 * For use in Server Components
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

/**
 * Check if the current user is an admin
 * For use in Server Components
 */
export async function requireAdmin() {
  const user = await requireAuth();
  
  // Fetch user role from database
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  // Type assertion:
  const role = (data as { role: 'admin' | 'customer' } | null)?.role;
  if (error || role !== 'admin') {
    redirect('/');
  }
  
  return user;
}

/**
 * Create a Supabase client for use in Server Components
 * with cookies for authentication
 */
export function createClient() {
  return createServerClient();
}