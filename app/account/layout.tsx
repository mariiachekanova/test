"use client"

import React, { useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { AccountSidebar } from "@/components/account-sidebar"
import { Footer } from "@/components/footer"
import { PageSkeleton } from "@/components/skeletons"
import { Breadcrumb } from "@/components/breadcrumb"

const PUBLIC_PATHS = ["/account/signin", "/account/signup"]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { loading } = useAuth()
  const hasResolvedOnce = useRef(false)

  useEffect(() => {
    if (!loading) hasResolvedOnce.current = true
  }, [loading])

  const isPublicPage = PUBLIC_PATHS.includes(pathname)

  // Only show spinner on initial load, never on background refreshes
  if (!hasResolvedOnce.current && loading) {
    return <PageSkeleton />
  }

  const pageName = pathname.split("/").filter(Boolean).pop() || "account"
  const breadcrumbLabel = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, " ")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {!isPublicPage && (
        <Breadcrumb items={[
          { label: "Account", href: "/account" },
          ...(pathname !== "/account" ? [{ label: breadcrumbLabel }] : []),
        ]} />
      )}
      <main className="flex-1 py-6 lg:py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <AccountSidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
