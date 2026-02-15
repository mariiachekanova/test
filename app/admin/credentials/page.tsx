"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Send, Search, Key, Plus, Trash2, Clock, Check, ChevronDown,
  Package, Mail, User, Phone, Loader2, AlertCircle, FileText,
  ShieldCheck, CreditCard,
} from "lucide-react"
import { AdminTableSkeleton } from "@/components/skeletons"

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
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

type Order = {
  id: string
  order_number: string
  status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  payment_method: string
  total: number
  created_at: string
  order_items: OrderItem[]
}

type CredentialField = { label: string; value: string }

const PAYMENT_LABELS: Record<string, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  connectips: "ConnectIPS",
  internet_banking: "Internet Banking",
}

export default function CredentialsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [credentials, setCredentials] = useState<CredentialField[]>([
    { label: "Email", value: "" },
    { label: "Password", value: "" },
  ])
  const [notes, setNotes] = useState("")
  const [sending, setSending] = useState(false)
  const [sentOrders, setSentOrders] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("status", ["pending", "processing", "completed"])
      .order("created_at", { ascending: false })
    if (!error && data) setOrders(data as Order[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filtered = orders.filter(o => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q)
  })

  function selectOrder(order: Order) {
    setSelectedOrder(order)
    setCredentials([{ label: "Email", value: "" }, { label: "Password", value: "" }])
    setNotes("")
  }

  function addCredentialField() {
    setCredentials([...credentials, { label: "", value: "" }])
  }

  function removeCredentialField(idx: number) {
    setCredentials(credentials.filter((_, i) => i !== idx))
  }

  function updateCredential(idx: number, field: "label" | "value", val: string) {
    setCredentials(credentials.map((c, i) => i === idx ? { ...c, [field]: val } : c))
  }

  async function handleSend() {
    if (!selectedOrder) return

    const validCreds = credentials.filter(c => c.label.trim() && c.value.trim())
    if (validCreds.length === 0) {
      toast({ variant: "destructive", title: "No credentials", description: "Add at least one credential field with label and value." })
      return
    }

    setSending(true)
    try {
      const items = selectedOrder.order_items.map(item => ({
        name: item.product_name,
        variant: [item.plan_name, item.duration_name, item.denomination_amount ? `NPR ${Number(item.denomination_amount).toLocaleString()}` : null].filter(Boolean).join(" / ") || undefined,
      }))

      const res = await fetch("/api/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          orderNumber: selectedOrder.order_number,
          customerEmail: selectedOrder.customer_email,
          customerName: selectedOrder.customer_name,
          items,
          credentials: validCreds,
          notes: notes.trim() || undefined,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to send")

      toast({ title: "Credentials sent", description: `Email sent to ${selectedOrder.customer_email}` })
      setSentOrders(prev => new Set(prev).add(selectedOrder.id))

      // Update local order status
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "completed" } : o))
      setSelectedOrder(null)
    } catch (err: any) {
      toast({ variant: "destructive", title: "Send failed", description: err.message })
    } finally {
      setSending(false)
    }
  }

  const pendingCount = orders.filter(o => o.status === "pending" || o.status === "processing").length

  return (
    <motion.div initial="hidden" animate="visible" className="flex flex-col gap-4">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Send Credentials
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {pendingCount} order{pendingCount !== 1 ? "s" : ""} awaiting credentials
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Orders List */}
        <motion.div variants={fadeUp} custom={1} className="lg:col-span-2 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search order #, name, email..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-card border border-border rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>

          {/* Order List */}
          {loading ? (
            <AdminTableSkeleton rows={4} cols={1} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[12px] text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
              {filtered.map((order) => {
                const isSent = sentOrders.has(order.id)
                const isSelected = selectedOrder?.id === order.id
                const isPending = order.status === "pending" || order.status === "processing"
                return (
                  <button key={order.id} onClick={() => selectOrder(order)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                        : "bg-card border-border hover:border-primary/20 hover:bg-secondary/30"
                    }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-bold text-foreground">{order.order_number}</p>
                          {isPending && !isSent && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">PENDING</span>
                          )}
                          {isSent && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">SENT</span>
                          )}
                          {order.status === "completed" && !isSent && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">COMPLETED</span>
                          )}
                        </div>
                        <p className="text-[11px] text-foreground mt-0.5 truncate">{order.customer_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{order.customer_email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-bold text-primary">NPR {Number(order.total).toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-[9px] text-muted-foreground">
                      <Package className="w-2.5 h-2.5" />
                      {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                      <span className="mx-0.5">-</span>
                      <CreditCard className="w-2.5 h-2.5" />
                      {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Credential Form */}
        <motion.div variants={fadeUp} custom={2} className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Order Summary */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/40">
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Order {selectedOrder.order_number}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedOrder.customer_name}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedOrder.customer_email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/5 border border-primary/20">
                      <Send className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-semibold text-primary">Ready to send</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5">
                    {selectedOrder.order_items.map(item => {
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
                          <p className="text-[11px] font-semibold text-foreground shrink-0">NPR {Number(item.total_price).toLocaleString()}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Credentials Input */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-primary" />
                      Credentials
                    </p>
                    <button onClick={addCredentialField}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
                      <Plus className="w-3 h-3" /> Add Field
                    </button>
                  </div>

                  <div className="space-y-2">
                    {credentials.map((cred, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Label (e.g. Email)"
                            value={cred.label}
                            onChange={(e) => updateCredential(idx, "label", e.target.value)}
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={cred.value}
                            onChange={(e) => updateCredential(idx, "value", e.target.value)}
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 font-mono"
                          />
                        </div>
                        {credentials.length > 1 && (
                          <button onClick={() => removeCredentialField(idx)}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer mt-0.5">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Add Presets */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/40">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wide mr-1 self-center">Quick add:</span>
                    {["Username", "Password", "PIN", "Activation Key", "License Code", "Download Link", "Redeem Code"].map(preset => (
                      <button key={preset} onClick={() => setCredentials([...credentials, { label: preset, value: "" }])}
                        className="px-2 py-0.5 rounded-md bg-secondary/60 border border-border/40 text-[9px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors cursor-pointer">
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-[12px] font-bold text-foreground flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Notes <span className="text-[10px] font-normal text-muted-foreground">(optional)</span>
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional instructions for the customer..."
                    rows={3}
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                {/* Email Preview Note */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
                  <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-sky-500">Email will be sent from support@royalsewa.com</p>
                    <p className="text-[10px] text-sky-400/80 mt-0.5">Credentials are sent via a branded HTML email to {selectedOrder.customer_email}. The order status will be set to completed automatically.</p>
                  </div>
                </div>

                {/* Send Button */}
                <button onClick={handleSend} disabled={sending}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending Credentials...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Credentials to {selectedOrder.customer_name}</>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-4">
                  <Key className="w-7 h-7 text-primary/30" />
                </div>
                <p className="text-[13px] font-semibold text-foreground mb-1">Select an order</p>
                <p className="text-[11px] text-muted-foreground max-w-[240px]">Choose an order from the left panel to enter and send account credentials to the customer.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}
