"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import {
  User,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Shield,
  LayoutDashboard,
} from "lucide-react"

const sidebarLinks = [
  { name: "Account Overview", href: "/account", icon: User },
  { name: "My Orders", href: "/account/orders", icon: ShoppingBag },
  { name: "Settings", href: "/account/settings", icon: Settings },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut, isAdmin } = useAuth()
  const isAuthPage = pathname === "/account/signin" || pathname === "/account/signup"
  const [open, setOpen] = useState(false)

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "Guest"
  const email = profile?.email || user?.email || ""
  const initial = displayName.charAt(0).toUpperCase()
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null
  const currentPage = sidebarLinks.find((l) => l.href === pathname)?.name || "My Account"

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
    router.push("/account/signin")
  }

  const sidebarContent = (
    <>
      {/* User Info */}
      <div className="flex items-center gap-3 pb-4 mb-3 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border shrink-0 overflow-hidden">
          {user ? (
            avatarUrl ? (
              <img src={avatarUrl || "/placeholder.svg"} alt={displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-[15px] font-bold text-primary">{initial}</span>
            )
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          {user ? (
            <>
              <div className="flex items-center gap-1.5">
                <p className="text-[14px] font-semibold text-foreground truncate">{displayName}</p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/15 text-primary border border-primary/20">
                    <Shield className="w-2.5 h-2.5" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground truncate">{email}</p>
            </>
          ) : (
            <>
              <p className="text-[14px] font-semibold text-foreground">Guest User</p>
              <span className="text-[12px]">
                <Link href="/account/signin" className="font-medium text-primary hover:underline cursor-pointer">Sign in</Link>
                <span className="text-muted-foreground"> to access your account</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={user ? link.href : "/account/signin"}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer group ${
                isActive && !isAuthPage
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-[16px] h-[16px] shrink-0" strokeWidth={1.75} />
              <span className="truncate">{link.name}</span>
              <ChevronRight className={`w-3.5 h-3.5 ml-auto shrink-0 transition-transform ${isActive && !isAuthPage ? "text-primary" : "text-muted-foreground/30 group-hover:text-muted-foreground"}`} />
            </Link>
          )
        })}
      </nav>

      {/* Admin Link */}
      {user && isAdmin && (
        <div className="mt-3 pt-3 border-t border-border">
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer group"
          >
            <LayoutDashboard className="w-[16px] h-[16px] shrink-0" strokeWidth={1.75} />
            <span>Admin Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 text-primary/40 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      )}

      {/* Logout */}
      {user && (
        <div className={`${isAdmin ? "mt-1" : "mt-3"} ${isAdmin ? "" : "pt-3 border-t border-border"}`}>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-[16px] h-[16px] shrink-0" strokeWidth={1.75} />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Mobile: in-page collapsible */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card text-foreground font-medium text-[14px] cursor-pointer hover:bg-secondary transition-colors"
        >
          <span>{currentPage}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl border border-border bg-card p-4">
                {sidebarContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: always visible */}
      <motion.aside
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:block w-[260px] shrink-0"
      >
        <div className="rounded-2xl border border-border bg-card p-5 sticky top-[110px]">
          {sidebarContent}
        </div>
      </motion.aside>
    </>
  )
}
