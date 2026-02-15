"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { OrdersListSkeleton } from "@/components/skeletons"
import {
  Package, Clock, CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp,
  ShoppingBag, ArrowRight, CreditCard, Mail, Phone, User, FileText,
} from "lucide-react"

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/15", icon: Clock },
  processing: { label: "Processing", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/15", icon: Package },
  completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10 border-red-400/15", icon: XCircle },
  refunded: { label: "Refunded", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/15", icon: RotateCcw },
}

const PAYMENT_LABELS: Record<string, string> = {
  esewa: "eSewa", khalti: "Khalti", connectips: "ConnectIPS", internet_banking: "Internet Banking",
}

interface OrderItem {
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

interface Order {
  id: string
  order_number: string
  status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_note: string | null
  payment_method: string
  total: number
  created_at: string
  order_items: OrderItem[]
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function MyOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    if (!user) return
    async function load() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
      if (!error && data) setOrders(data as Order[])
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter)

  if (loading) {
    return <OrdersListSkeleton count={4} />
  }

  if (orders.length === 0) {
    return (
      <FadeIn className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
          <ShoppingBag className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">No orders yet</p>
        <p className="text-[11px] text-muted-foreground/70 mb-4">Your order history will appear here after your first purchase.</p>
        <Link href="/store" className="px-5 py-2 bg-primary text-primary-foreground text-[12px] font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          Browse Store <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </FadeIn>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-base font-bold text-foreground">My Orders</h1>
            <p className="text-[11px] text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
          </div>
        </div>
      </FadeIn>

      {/* Filter tabs */}
      <FadeIn delay={50}>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "processing", label: "Processing" },
            { key: "completed", label: "Completed" },
            { key: "cancelled", label: "Cancelled" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              {f.label}
              {f.key !== "all" && (
                <span className="ml-1 opacity-60">{orders.filter(o => o.status === f.key).length}</span>
              )}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.map((order, i) => {
          const status = STATUS_MAP[order.status] || STATUS_MAP.pending
          const StatusIcon = status.icon
          const isExpanded = expandedId === order.id

          return (
            <FadeIn key={order.id} delay={100 + i * 50}>
              <div className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-border/80">
                {/* Order header */}
                <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full p-3.5 flex items-start justify-between text-left cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[12px] font-bold text-foreground">{order.order_number}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {status.label}
                      </span>
                    </div>

                    {/* Items preview */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex -space-x-1.5">
                        {order.order_items.slice(0, 3).map(item => (
                          <div key={item.id} className="w-7 h-7 rounded-md bg-secondary border border-card overflow-hidden">
                            {item.product_image ? (
                              <Image src={item.product_image} alt="" width={28} height={28} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-3 h-3 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <div className="w-7 h-7 rounded-md bg-secondary border border-card flex items-center justify-center">
                            <span className="text-[8px] font-bold text-muted-foreground">+{order.order_items.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{timeAgo(order.created_at)}</span>
                      <span className="text-muted-foreground/30">|</span>
                      <span>{PAYMENT_LABELS[order.payment_method] || order.payment_method}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[13px] font-bold text-primary">NPR {Number(order.total).toLocaleString()}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border animate-in fade-in slide-in-from-top-1 duration-300">
                    {/* Line items */}
                    <div className="p-3.5 space-y-2.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Items</p>
                      {order.order_items.map(item => {
                        const variant = [item.plan_name, item.duration_name, item.denomination_amount ? `NPR ${Number(item.denomination_amount).toLocaleString()}` : null].filter(Boolean).join(" / ")
                        return (
                          <div key={item.id} className="flex gap-2.5">
                            <div className="w-10 h-10 rounded-md bg-secondary border border-border/50 overflow-hidden shrink-0">
                              {item.product_image ? (
                                <Image src={item.product_image} alt={item.product_name} width={40} height={40} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-foreground truncate">{item.product_name}</p>
                              {variant && <p className="text-[9px] text-muted-foreground truncate">{variant}</p>}
                              {item.product_type && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-medium bg-secondary text-muted-foreground capitalize">{item.product_type.replace(/_/g, " ")}</span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[11px] font-semibold text-foreground">NPR {Number(item.total_price).toLocaleString()}</p>
                              <p className="text-[9px] text-muted-foreground">x{item.quantity} @ NPR {Number(item.unit_price).toLocaleString()}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Customer & Payment Info */}
                    <div className="border-t border-border p-3.5 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Customer</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <User className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-foreground">{order.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-foreground truncate">{order.customer_email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-foreground">{order.customer_phone}</span>
                          </div>
                          {order.customer_note && (
                            <div className="flex items-start gap-1.5 text-[10px] mt-1">
                              <FileText className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-foreground/70 leading-relaxed">{order.customer_note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Payment</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <CreditCard className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-foreground">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</span>
                          </div>
                          <p className="text-[12px] font-bold text-primary">NPR {Number(order.total).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          )
        })}

        {filtered.length === 0 && (
          <FadeIn className="text-center py-10">
            <p className="text-[12px] text-muted-foreground">No {filter !== "all" ? filter : ""} orders found.</p>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
