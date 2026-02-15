"use client"

import { motion } from "framer-motion"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package } from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const stats = [
  { label: "Total Revenue", value: "NPR 0", change: "+0%", trend: "up", icon: DollarSign },
  { label: "Total Orders", value: "0", change: "+0%", trend: "up", icon: ShoppingBag },
  { label: "Total Customers", value: "0", change: "+0%", trend: "up", icon: Users },
  { label: "Products Sold", value: "0", change: "+0%", trend: "down", icon: Package },
]

export default function AnalyticsPage() {
  return (
    <motion.div initial="hidden" animate="visible" className="flex flex-col gap-4">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-primary" />
          Analytics
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Sales insights and performance metrics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
          return (
            <motion.div key={stat.label} variants={fadeUp} custom={i + 1}>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-medium ${stat.trend === "up" ? "text-emerald-500" : "text-destructive"}`}>
                    <TrendIcon className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{stat.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Placeholder */}
      <motion.div variants={fadeUp} custom={5} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-[15px] font-semibold text-foreground mb-4">Revenue Over Time</h3>
          <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-xl">
            <p className="text-[13px] text-muted-foreground">Chart coming soon...</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-[15px] font-semibold text-foreground mb-4">Top Products</h3>
          <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-xl">
            <p className="text-[13px] text-muted-foreground">Chart coming soon...</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
