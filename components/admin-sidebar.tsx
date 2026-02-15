"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  FileText,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Star,
  ImageIcon,
  KeyRound,
} from "lucide-react"

const adminLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Hero Slides", href: "/admin/hero", icon: ImageIcon },
  { name: "Featured", href: "/admin/featured", icon: Star },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Credentials", href: "/admin/credentials", icon: KeyRound },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const currentPage = adminLinks.find((l) => l.href === pathname)?.name || "Admin"

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="pb-4 mb-3 border-b border-border">
        <h2 className="text-[15px] font-bold text-foreground">Admin Panel</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Manage your store</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-[16px] h-[16px] shrink-0" strokeWidth={1.75} />
              <span className="truncate">{link.name}</span>
              <ChevronRight className={`w-3.5 h-3.5 ml-auto shrink-0 transition-transform ${isActive ? "text-primary" : "text-muted-foreground/30 group-hover:text-muted-foreground"}`} />
            </Link>
          )
        })}
      </nav>

      {/* Back to Account */}
      <div className="mt-3 pt-3 border-t border-border">
        <Link
          href="/account"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer group"
        >
          <svg className="w-[16px] h-[16px] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span>Back to Account</span>
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile: in-page collapsible */}
      <div className="lg:hidden mb-4">
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
        className="hidden lg:block w-[240px] shrink-0"
      >
        <div className="rounded-2xl border border-border bg-card p-4 sticky top-[110px]">
          {sidebarContent}
        </div>
      </motion.aside>
    </>
  )
}
