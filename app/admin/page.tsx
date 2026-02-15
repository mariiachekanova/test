"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  Settings,
  BarChart3,
  Shield,
  ArrowRight,
  Clock,
  Activity,
} from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const adminStats = [
  { label: "Total Users", value: "0", icon: Users, color: "text-sky-400", trend: "+0%", href: "/admin/users" },
  { label: "Total Orders", value: "0", icon: ShoppingBag, color: "text-emerald-500", trend: "+0%", href: "/admin/orders" },
  { label: "Revenue", value: "NPR 0", icon: DollarSign, color: "text-amber-500", trend: "+0%", href: "/admin/revenue" },
  { label: "Products", value: "0", icon: Package, color: "text-violet-400", trend: "+0%", href: "/admin/products" },
]

const adminLinks = [
  { label: "Manage Users", description: "View and manage user accounts and roles", icon: Users, href: "/admin/users" },
  { label: "Manage Orders", description: "View, process, and track orders", icon: ShoppingBag, href: "/admin/orders" },
  { label: "Manage Products", description: "Add, edit, and remove products", icon: Package, href: "/admin/products" },
  { label: "Analytics", description: "Sales reports and insights", icon: BarChart3, href: "/admin/analytics" },
  { label: "Settings", description: "Site configuration and preferences", icon: Settings, href: "/admin/settings" },
  { label: "Activity Log", description: "Recent admin actions and events", icon: Activity, href: "/admin/activity" },
]

export default function AdminDashboardPage() {
  const { profile } = useAuth()

  return (
    <motion.div initial="hidden" animate="visible" className="flex flex-col gap-4">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/15 text-primary border border-primary/20">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Overview of your store performance and management tools.
          </p>
        </div>
        <Link href="/account" className="self-start px-4 py-2 text-[12px] font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-lg border border-border transition-colors cursor-pointer">
          Back to Account
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {adminStats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={fadeUp} custom={i + 1}>
              <Link href={stat.href} className="block rounded-2xl border border-border bg-card p-4 hover:border-primary/20 transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className={`w-[18px] h-[18px] ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>
                <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{stat.value}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Management Links */}
      <motion.div variants={fadeUp} custom={5} className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground mb-3">Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {adminLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/40 hover:bg-secondary border border-transparent hover:border-border transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-card flex items-center justify-center border border-border group-hover:border-primary/20 shrink-0 transition-colors">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">{link.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{link.description}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary shrink-0 transition-colors" />
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={fadeUp} custom={6} className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-foreground">Recent Activity</h2>
          <Link href="/admin/activity" className="text-[12px] font-medium text-primary hover:underline cursor-pointer flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <p className="text-[14px] text-muted-foreground font-medium">No recent activity</p>
          <p className="text-[12px] text-muted-foreground/70 mt-1">Admin actions will be logged here.</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
