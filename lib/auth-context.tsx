"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export type Profile = {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (data: { fullName: string; email: string; password: string }) => Promise<{ success: boolean; error?: string; autoSignedIn?: boolean }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Singleton client -- reuse across renders so auth listeners persist
let supabaseClient: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!supabaseClient) supabaseClient = createClient()
  return supabaseClient
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)
  const profileCacheRef = useRef<Map<string, { data: Profile; ts: number }>>(new Map())

  const supabase = getSupabase()

  const fetchProfile = useCallback(async (userId: string, force = false) => {
    // Cache for 30s to avoid redundant queries
    const cached = profileCacheRef.current.get(userId)
    if (!force && cached && Date.now() - cached.ts < 30_000) {
      setProfile(cached.data)
      return cached.data
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (data && !error) {
      const p = data as Profile
      setProfile(p)
      profileCacheRef.current.set(userId, { data: p, ts: Date.now() })
      return p
    }
    return null
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id, true)
  }, [user, fetchProfile])

  // Initialize auth state
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let mounted = true

    const init = async () => {
      try {
        // Use getUser() for server-validated session (not stale localStorage)
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        if (!mounted) return

        if (currentUser) {
          setUser(currentUser)
          setSession(currentSession)
          await fetchProfile(currentUser.id)
        } else {
          setUser(null)
          setSession(null)
          setProfile(null)
        }
      } catch {
        // Session expired or network error
        if (mounted) {
          setUser(null)
          setSession(null)
          setProfile(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
          setSession(null)
          profileCacheRef.current.clear()
          return
        }

        if (newSession?.user) {
          setSession(newSession)
          setUser(newSession.user)

          // Only force-refresh profile on actual sign-in or user update
          // TOKEN_REFRESHED happens silently -- use cached profile
          const forceRefresh = event === "SIGNED_IN" || event === "USER_UPDATED"
          fetchProfile(newSession.user.id, forceRefresh).catch(() => {})
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // Heartbeat: silently re-validate session when tab becomes visible
  // IMPORTANT: This must NOT reset loading/user/profile states to avoid
  // unmounting pages and losing their fetched data
  useEffect(() => {
    const refreshingRef = { current: false }

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return
      if (refreshingRef.current) return
      refreshingRef.current = true

      try {
        // Silently refresh the session token (Supabase handles this internally)
        const { data: { session: freshSession } } = await supabase.auth.getSession()

        if (freshSession?.user) {
          // Only update if user changed -- never clear existing state
          setUser(prev => {
            if (prev?.id !== freshSession.user.id) return freshSession.user
            return prev
          })
          setSession(freshSession)
          // Background profile refresh -- don't await, don't block
          fetchProfile(freshSession.user.id, true).catch(() => {})
        } else if (!freshSession) {
          // Only sign out if we were previously signed in AND server confirms no session
          const { data: { user: serverUser } } = await supabase.auth.getUser()
          if (!serverUser) {
            setUser(null)
            setProfile(null)
            setSession(null)
            profileCacheRef.current.clear()
          }
        }
      } catch {
        // Network error -- keep existing state, don't disrupt the UI
      } finally {
        refreshingRef.current = false
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [supabase, fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    // Immediately update state so the UI reflects the signed-in user without waiting for onAuthStateChange
    if (data.session?.user) {
      setUser(data.session.user)
      setSession(data.session)
      await fetchProfile(data.session.user.id, true)
    }
    return { success: true }
  }, [supabase, fetchProfile])

  const signUp = useCallback(async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "user" },
      },
    })
    if (error) return { success: false, error: error.message }
    // Supabase auto-signs in on signup when email confirmation is not enforced
    // Immediately update state so user is signed in right away
    if (data.session?.user) {
      setUser(data.session.user)
      setSession(data.session)
      await fetchProfile(data.session.user.id, true)
      return { success: true, autoSignedIn: true }
    }
    return { success: true, autoSignedIn: false }
  }, [supabase, fetchProfile])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
      },
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    profileCacheRef.current.clear()
  }, [supabase])

  const isAdmin = profile?.role === "admin"

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, isAdmin, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
