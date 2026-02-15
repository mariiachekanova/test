"use client"

import React, { useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ShieldAlert } from "lucide-react"
import { PageSkeleton } from "@/components/skeletons"
import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin } = useAuth()
  const hasResolvedOnce = useRef(false)

  // Track whether we've done the initial auth resolution
  useEffect(() => {
    if (!loading && (user === null || profile !== null)) {
      hasResolvedOnce.current = true
    }
  }, [loading, user, profile])

  // Only show full-screen spinner on INITIAL load, never on background refreshes
  if (!hasResolvedOnce.current && (loading || (user && !profile))) {
    return <PageSkeleton />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-foreground mb-1">Authentication Required</h1>
            <p className="text-[14px] text-muted-foreground mb-4">You need to sign in to access this page.</p>
            <Link href="/account/signin" className="px-5 py-2.5 bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAdmin && hasResolvedOnce.current) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShieldAlert className="w-12 h-12 text-destructive/50 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-foreground mb-1">Access Denied</h1>
            <p className="text-[14px] text-muted-foreground mb-4">{"You don't have admin privileges to access this page."}</p>
            <Link href="/account" className="px-5 py-2.5 bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              Go to Account
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-6 lg:py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <AdminSidebar />
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
