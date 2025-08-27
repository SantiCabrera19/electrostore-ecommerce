'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    checkUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    signOut,
    getUserProfile,
    isAuthenticated: !!user
  }
}
