"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { ShoppingBag, Clock, ArrowRight, Shield, Package, Settings } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { OrdersListSkeleton } from "@/components/skeletons"

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-400",
  processing: "text-blue-400",
  completed: "text-emerald-400",
  cancelled: "text-red-400",
  refunded: "text-purple-400",
}

const PAYMENT_LABELS: Record<string, string> = {
  esewa: "eSewa", khalti: "Khalti", connectips: "ConnectIPS", internet_banking: "Internet Banking",
}

interface RecentOrder {
  id: string
  order_number: string
  status: string
  total: number
  payment_method: string
  created_at: string
  order_items: { id: string; product_name: string; product_image: string | null }[]
}

const quickActions = [
  { label: "Browse Store", href: "/store", icon: Package },
  { label: "Order History", href: "/account/orders", icon: Clock },
  { label: "Settings", href: "/account/settings", icon: Settings },
]

export default function AccountOverviewPage() {
  const { user, profile, isAdmin } = useAuth()
  const [orderCount, setOrderCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, payment_method, created_at, order_items(id, product_name, product_image)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(3)
      if (!error && data) {
        setRecentOrders(data as RecentOrder[])
      }
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
      setOrderCount(count || 0)
      setLoadingOrders(false)
    }
    load()
  }, [user])

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "User"
  const firstName = displayName.split(" ")[0]

  const stats = [
    { label: "Total Orders", value: `${orderCount}`, icon: ShoppingBag, href: "/account/orders", color: "text-emerald-500" },
    { label: "Browse Store", value: "Shop now", icon: Package, href: "/store", color: "text-primary" },
    { label: "Settings", value: "Manage", icon: Settings, href: "/account/settings", color: "text-sky-400" },
  ]

  return (
    <motion.div initial="hidden" animate="visible" className="flex flex-col gap-4">
      {/* Welcome Banner */}
      <motion.div variants={fadeUp} custom={0} className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="relative px-5 sm:px-6 py-5">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  Welcome back, {firstName}!
                </h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/15 text-primary border border-primary/20">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[13px] sm:text-[14px] text-muted-foreground leading-relaxed">
                Manage your account, orders, and settings from here.
              </p>
              {isAdmin && (
                <Link href="/admin" className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 text-[12px] font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Go to Admin Dashboard
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={fadeUp} custom={i + 1}>
              <Link
                href={stat.href}
                className="block rounded-2xl border border-border bg-card p-4 hover:border-primary/20 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-auto group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                <p className="text-[16px] font-semibold text-foreground mt-0.5">{stat.value}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} custom={5} className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all cursor-pointer group"
              >
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[12px] font-medium text-muted-foreground group-hover:text-foreground text-center">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div variants={fadeUp} custom={6} className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-foreground">Recent Orders</h2>
          <Link href="/account/orders" className="text-[12px] font-medium text-primary hover:underline cursor-pointer flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loadingOrders ? (
          <OrdersListSkeleton count={2} />
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <p className="text-[14px] text-muted-foreground font-medium">No orders yet</p>
            <p className="text-[12px] text-muted-foreground/70 mt-1">Your order history will appear here.</p>
            <Link href="/store" className="mt-4 px-5 py-2 bg-primary text-primary-foreground text-[12px] font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              Browse Store
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentOrders.map(order => {
              const statusColor = STATUS_COLORS[order.status] || "text-muted-foreground"
              return (
                <Link key={order.id} href="/account/orders"
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group">
                  {/* Product thumbnails */}
                  <div className="flex -space-x-1.5 shrink-0">
                    {order.order_items.slice(0, 2).map(item => (
                      <div key={item.id} className="w-8 h-8 rounded-md bg-secondary border border-card overflow-hidden">
                        {item.product_image ? (
                          <Image src={item.product_image} alt="" width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-3 h-3 text-muted-foreground" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-medium text-foreground">{order.order_number}</p>
                      <span className={`text-[9px] font-semibold capitalize ${statusColor}`}>{order.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} - {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-bold text-primary">NPR {Number(order.total).toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function LayoutDashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  )
}
