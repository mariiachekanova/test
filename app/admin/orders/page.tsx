"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import {
  ShoppingBag, Search, Eye, Check, X, Clock, RefreshCw, ChevronDown,
  Package, CreditCard, Phone, Mail, User, FileText, ImageIcon, ExternalLink, Loader2,
} from "lucide-react"
import { AdminTableSkeleton } from "@/components/skeletons"

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  processing: { label: "Processing", color: "bg-sky-500/10 text-sky-500 border-sky-500/20", icon: RefreshCw },
  completed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: Check },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", icon: X },
  refunded: { label: "Refunded", color: "bg-violet-500/10 text-violet-500 border-violet-500/20", icon: RefreshCw },
}

const PAYMENT_LABELS: Record<string, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  connectips: "ConnectIPS",
  internet_banking: "Internet Banking",
}

type Order = {
  id: string
  order_number: string
  user_id: string
  status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_note: string | null
  payment_method: string
  payment_screenshot_url: string | null
  subtotal: number
  total: number
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

type OrderItem = {
  id: string
  product_name: string
  product_image: string | null
  product_type: string | null
  quantity: number
  unit_price: number
  total_price: number
  plan_name: string | null
  duration_name: string | null
  denomination_amount: number | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
    if (!error && data) setOrders(data as Order[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingStatus(orderId)
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
    setUpdatingStatus(null)
  }

  const filtered = orders.filter(o => {
    const matchesSearch = searchQuery.trim() === "" ||
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
    revenue: orders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.total), 0),
  }

  return (
    <motion.div initial="hidden" animate="visible" className="flex flex-col gap-4">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Orders
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">{stats.total} total orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-[11px] font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer">
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} custom={0.5} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: "Pending", value: stats.pending, color: "text-amber-500" },
          { label: "Processing", value: stats.processing, color: "text-sky-500" },
          { label: "Completed", value: stats.completed, color: "text-emerald-500" },
          { label: "Revenue", value: `NPR ${stats.revenue.toLocaleString()}`, color: "text-primary" },
        ].map(s => (
          <div key={s.label} className="p-2.5 rounded-lg border border-border bg-card">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search by order #, name, email..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-card border border-border rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-[12px] font-medium text-foreground cursor-pointer focus:outline-none focus:border-primary/50">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </motion.div>

      {/* Orders List */}
          {loading ? (
            <AdminTableSkeleton rows={5} cols={5} />
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} custom={2} className="text-center py-16">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-[12px] text-muted-foreground">{orders.length === 0 ? "No orders yet" : "No orders match your filters"}</p>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} custom={2} className="space-y-2.5">
          {filtered.map((order) => {
            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const StatusIcon = sc.icon
            const isExpanded = expandedOrder === order.id
            const isUpdating = updatingStatus === order.id

            return (
              <div key={order.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Order Row */}
                <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-secondary/30 transition-colors cursor-pointer text-left">
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                    <div>
                      <p className="text-[12px] font-bold text-foreground">{order.order_number}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[11px] font-medium text-foreground truncate">{order.customer_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{order.customer_email}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${sc.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" /> {sc.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-bold text-primary">NPR {Number(order.total).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 border-t border-border space-y-3 pt-3">
                        {/* Customer + Payment Info */}
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Customer Info</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] text-foreground"><User className="w-3 h-3 text-muted-foreground" />{order.customer_name}</div>
                              <div className="flex items-center gap-1.5 text-[11px] text-foreground"><Mail className="w-3 h-3 text-muted-foreground" />{order.customer_email}</div>
                              <div className="flex items-center gap-1.5 text-[11px] text-foreground"><Phone className="w-3 h-3 text-muted-foreground" />{order.customer_phone}</div>
                              {order.customer_note && (
                                <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground"><FileText className="w-3 h-3 mt-0.5 shrink-0" /><span>{order.customer_note}</span></div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Payment</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] text-foreground">
                                <CreditCard className="w-3 h-3 text-muted-foreground" />
                                {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                              </div>
                              {order.payment_screenshot_url && (
                                <a href={order.payment_screenshot_url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                                  <ImageIcon className="w-3 h-3" /> View Screenshot <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Items */}
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Items</p>
                          <div className="space-y-1.5">
                            {order.order_items.map(item => {
                              const variant = [item.plan_name, item.duration_name, item.denomination_amount ? `NPR ${Number(item.denomination_amount).toLocaleString()}` : null].filter(Boolean).join(" / ")
                              return (
                                <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-secondary/40 border border-border/40">
                                  {item.product_image && (
                                    <div className="w-8 h-8 rounded-md overflow-hidden bg-secondary border border-border/40 shrink-0">
                                      <Image src={item.product_image} alt={item.product_name} width={32} height={32} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium text-foreground truncate">{item.product_name}</p>
                                    {variant && <p className="text-[9px] text-muted-foreground">{variant}</p>}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-[11px] font-semibold text-foreground">NPR {Number(item.total_price).toLocaleString()}</p>
                                    <p className="text-[9px] text-muted-foreground">x{item.quantity} @ NPR {Number(item.unit_price).toLocaleString()}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Status Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                          <p className="text-[10px] text-muted-foreground">
                            Placed {new Date(order.created_at).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                            ) : (
                              <>
                                {order.status === "pending" && (
                                  <>
                                    <button onClick={() => updateOrderStatus(order.id, "processing")}
                                      className="px-2 py-1 rounded text-[10px] font-medium bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors cursor-pointer">
                                      Process
                                    </button>
                                    <button onClick={() => updateOrderStatus(order.id, "cancelled")}
                                      className="px-2 py-1 rounded text-[10px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer">
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {order.status === "processing" && (
                                  <button onClick={() => updateOrderStatus(order.id, "completed")}
                                    className="px-2 py-1 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                                    Complete
                                  </button>
                                )}
                                {(order.status === "completed") && (
                                  <button onClick={() => updateOrderStatus(order.id, "refunded")}
                                    className="px-2 py-1 rounded text-[10px] font-medium bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors cursor-pointer">
                                    Refund
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
