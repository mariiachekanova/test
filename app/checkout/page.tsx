"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { useCart, type CartItem } from "@/lib/cart-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { createClient } from "@/lib/supabase/client"
import {
  User, Phone, Mail, FileText, Upload, CheckCircle2,
  ChevronRight, ArrowLeft, ShoppingBag, Loader2, AlertCircle, ImageIcon, X,
  Package, Clock, Shield, Copy, Check, CreditCard, ArrowRight,
} from "lucide-react"

/* ── Payment methods ── */
const PAYMENT_METHODS = [
  { id: "esewa", name: "eSewa", color: "#60BB46", desc: "Pay via eSewa mobile wallet", accountId: "9800000000", accountName: "Premium Subscriptions Digital" },
  { id: "khalti", name: "Khalti", color: "#5C2D91", desc: "Pay via Khalti digital wallet", accountId: "9800000000", accountName: "Premium Subscriptions Digital" },
  { id: "connectips", name: "ConnectIPS", color: "#004B93", desc: "Pay via ConnectIPS bank transfer", accountId: "RS-CONNECT-001", accountName: "Premium Subscriptions Digital Pvt. Ltd." },
  { id: "internet_banking", name: "Internet Banking", color: "#0f766e", desc: "Direct bank transfer", accountId: "014-0028376501", accountName: "Premium Subscriptions Digital Pvt. Ltd." },
] as const

function getItemPrice(item: CartItem) {
  if (item.duration) return item.duration.price
  if (item.denomination) return item.denomination.amount
  return item.product.base_price
}

function getItemVariant(item: CartItem) {
  const parts: string[] = []
  if (item.plan) parts.push(item.plan.plan_name)
  if (item.duration) parts.push(item.duration.duration_name)
  if (item.denomination) parts.push(`NPR ${item.denomination.amount.toLocaleString()}`)
  return parts.join(" / ")
}

const STEPS = [
  { num: 1, label: "Information" },
  { num: 2, label: "Payment" },
  { num: 3, label: "Confirm" },
]

function PaymentLogo({ method, size = 28 }: { method: string; size?: number }) {
  const logos: Record<string, React.ReactNode> = {
    esewa: (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="#60BB46" /><text x="20" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">e</text></svg>),
    khalti: (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="#5C2D91" /><text x="20" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">K</text></svg>),
    connectips: (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="#004B93" /><text x="20" y="26" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">IPS</text></svg>),
    internet_banking: (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="#0f766e" /><text x="20" y="26" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">B</text></svg>),
  }
  return <>{logos[method] || null}</>
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

/* ── Saved order for success screen ── */
interface PlacedOrder {
  orderNumber: string
  items: CartItem[]
  subtotal: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerNote: string
  paymentMethod: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { items, getSubtotal, clearCart } = useCart()

  useEffect(() => {
    if (!authLoading && !user) router.replace("/account/signin?redirect=/checkout")
  }, [authLoading, user, router])

  const [step, setStep] = useState(1)
  const [animKey, setAnimKey] = useState(0)

  // Step 1
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (profile) { setName(profile.full_name || ""); setEmail(profile.email || "") }
    if (user?.phone) setPhone(user.phone)
  }, [profile, user])

  // Step 2
  const [paymentMethod, setPaymentMethod] = useState<string>("")

  // Step 3
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null)
  const [copiedField, setCopiedField] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const subtotal = getSubtotal()
  const step1Valid = name.trim().length > 0 && email.trim().length > 0 && phone.trim().length >= 7
  const step2Valid = paymentMethod.length > 0
  const step3Valid = screenshotFile !== null

  const goToStep = useCallback((s: number) => {
    setStep(s)
    setAnimKey(k => k + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshotFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setScreenshotPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handlePlaceOrder() {
    if (!user || !step3Valid || submitting) return
    setSubmitting(true)
    setError("")

    // Snapshot cart before clearing
    const orderItems = [...items]
    const orderSubtotal = subtotal

    try {
      const supabase = createClient()
      let screenshotUrl = ""
      if (screenshotFile) {
        const ext = screenshotFile.name.split(".").pop() || "png"
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from("payment-screenshots")
          .upload(path, screenshotFile, { cacheControl: "3600", upsert: false })
        if (uploadErr) throw new Error("Failed to upload screenshot")
        const { data: urlData } = supabase.storage.from("payment-screenshots").getPublicUrl(path)
        screenshotUrl = urlData.publicUrl
      }
      const { data: onData } = await supabase.rpc("generate_order_number")
      const orderNum = onData || `RS-${Date.now()}`
      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        order_number: orderNum,
        user_id: user.id,
        status: "pending",
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        customer_note: note.trim() || null,
        payment_method: paymentMethod,
        payment_screenshot_url: screenshotUrl,
        subtotal: orderSubtotal,
        total: orderSubtotal,
      }).select("id, order_number").single()
      if (orderErr || !order) throw new Error(orderErr?.message || "Failed to create order")

      const dbItems = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.image_url,
        product_type: item.product.product_type,
        quantity: item.quantity,
        unit_price: getItemPrice(item),
        total_price: getItemPrice(item) * item.quantity,
        plan_name: item.plan?.plan_name || null,
        duration_name: item.duration?.duration_name || null,
        denomination_amount: item.denomination?.amount || null,
      }))
      const { error: itemsErr } = await supabase.from("order_items").insert(dbItems)
      if (itemsErr) throw new Error("Failed to save order items")

      // Save for success screen, then clear cart
      setPlacedOrder({
        orderNumber: order.order_number,
        items: orderItems,
        subtotal: orderSubtotal,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        customerNote: note.trim(),
        paymentMethod,
      })
      clearCart()
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }
  if (!user) return null

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Breadcrumb items={[{ label: "Checkout" }]} />
        <main className="flex-1 flex items-center justify-center px-4">
          <FadeIn className="text-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Your cart is empty</p>
            <Link href="/store" className="text-xs text-primary hover:underline">Browse Store</Link>
          </FadeIn>
        </main>
        <Footer />
      </div>
    )
  }

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod)

  /* ── Order Success Screen ── */
  if (placedOrder) {
    const pm = PAYMENT_METHODS.find(m => m.id === placedOrder.paymentMethod)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Breadcrumb items={[{ label: "Order Placed" }]} />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-lg mx-auto space-y-4">

            {/* Success header */}
            <FadeIn className="text-center" delay={0}>
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="text-lg font-bold text-foreground mb-0.5">Order Placed Successfully</h1>
              <p className="text-xs text-muted-foreground">
                Order <span className="text-primary font-bold">{placedOrder.orderNumber}</span>
              </p>
            </FadeIn>

            {/* Products ordered */}
            <FadeIn delay={100}>
              <div className="p-3.5 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2.5">Items Ordered ({placedOrder.items.length})</p>
                <div className="space-y-2.5">
                  {placedOrder.items.map(item => {
                    const price = getItemPrice(item)
                    const variant = getItemVariant(item)
                    return (
                      <div key={item.id} className="flex gap-2.5">
                        <div className="w-10 h-10 rounded-md bg-secondary border border-border/50 overflow-hidden shrink-0">
                          {item.product.image_url && (
                            <Image src={item.product.image_url} alt={item.product.name} width={40} height={40} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{item.product.name}</p>
                          {variant && <p className="text-[9px] text-muted-foreground truncate">{variant}</p>}
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[10px] text-muted-foreground">Qty: {item.quantity}</span>
                            <span className="text-[11px] font-semibold text-foreground">NPR {(price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-border mt-2.5 pt-2.5 flex justify-between">
                  <span className="text-[11px] font-semibold text-foreground">Total</span>
                  <span className="text-[13px] font-bold text-primary">NPR {placedOrder.subtotal.toLocaleString()}</span>
                </div>
              </div>
            </FadeIn>

            {/* Customer + Payment info */}
            <div className="grid grid-cols-2 gap-3">
              <FadeIn delay={200}>
                <div className="p-3 rounded-lg border border-border bg-card h-full">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Customer</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <User className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate">{placedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate">{placedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{placedOrder.customerPhone}</span>
                    </div>
                    {placedOrder.customerNote && (
                      <div className="flex items-start gap-1.5 text-[11px]">
                        <FileText className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-foreground/70 text-[10px] leading-relaxed">{placedOrder.customerNote}</span>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={300}>
                <div className="p-3 rounded-lg border border-border bg-card h-full">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Payment</p>
                  <div className="flex items-center gap-2 mb-2">
                    <PaymentLogo method={placedOrder.paymentMethod} size={22} />
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">{pm?.name}</p>
                      <p className="text-[9px] text-muted-foreground">Screenshot submitted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/15">
                    <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="text-[10px] text-amber-400 font-medium">Verification pending</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* What happens next */}
            <FadeIn delay={400}>
              <div className="p-3.5 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">What Happens Next</p>
                <div className="space-y-3">
                  {[
                    { icon: Clock, title: "Payment Verification", desc: "We will verify your payment within 15-30 minutes.", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { icon: Package, title: "Order Processing", desc: "Once verified, your digital products will be prepared.", color: "text-blue-400", bg: "bg-blue-400/10" },
                    { icon: Mail, title: "Delivery", desc: "Product keys/codes delivered via email and your account.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { icon: Shield, title: "24/7 Support", desc: "Need help? Contact our support team anytime.", color: "text-purple-400", bg: "bg-purple-400/10" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className={`w-6 h-6 rounded-full ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <item.icon className={`w-3 h-3 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-foreground">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Actions */}
            <FadeIn delay={500}>
              <div className="flex gap-2">
                <Link href="/account/orders" className="flex-1 py-2.5 text-xs font-medium rounded-lg border border-border text-center text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> My Orders
                </Link>
                <Link href="/store" className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
                  Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      <main className="flex-1 py-6 lg:py-8">
        <div className="max-w-3xl mx-auto px-4">

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                    step > s.num ? "bg-emerald-500 text-white" :
                    step === s.num ? "bg-primary text-primary-foreground scale-110" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {step > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:block transition-colors duration-300 ${
                    step >= s.num ? "text-foreground" : "text-muted-foreground"
                  }`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 sm:w-20 h-[1.5px] mx-2 rounded-full transition-all duration-500 ${
                    step > s.num ? "bg-emerald-500" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-3" key={animKey}>

              {/* Step 1: Information */}
              {step === 1 && (
                <FadeIn className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground mb-0.5">Contact Information</h2>
                    <p className="text-[11px] text-muted-foreground">We will use this to contact you about your order.</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                          className="w-full pl-8 pr-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                          className="w-full pl-8 pr-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="98XXXXXXXX"
                          className="w-full pl-8 pr-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Note <span className="text-muted-foreground/50">(optional)</span></label>
                      <div className="relative">
                        <FileText className="absolute left-2.5 top-3 w-3.5 h-3.5 text-muted-foreground" />
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Any special instructions..."
                          className="w-full pl-8 pr-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => goToStep(2)} disabled={!step1Valid}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    Continue to Payment <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </FadeIn>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <FadeIn className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground mb-0.5">Payment Method</h2>
                    <p className="text-[11px] text-muted-foreground">Choose how you would like to pay.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PAYMENT_METHODS.map(m => (
                      <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                          paymentMethod === m.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border bg-card hover:border-muted-foreground/20"
                        }`}>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <PaymentLogo method={m.id} size={32} />
                          <span className="text-[12px] font-semibold text-foreground">{m.name}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => goToStep(1)}
                      className="px-4 py-2.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <button onClick={() => goToStep(3)} disabled={!step2Valid}
                      className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                      Continue to Confirm <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </FadeIn>
              )}

              {/* Step 3: Confirm & Upload */}
              {step === 3 && selectedMethod && (
                <FadeIn className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground mb-0.5">Confirm & Pay</h2>
                    <p className="text-[11px] text-muted-foreground">
                      Send <span className="text-primary font-bold">NPR {subtotal.toLocaleString()}</span> via <span className="font-semibold text-foreground">{selectedMethod.name}</span> and upload proof of payment.
                    </p>
                  </div>

                  {/* QR Code + Payment Details */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2.5 mb-3">
                      <PaymentLogo method={paymentMethod} size={28} />
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">{selectedMethod.name}</p>
                        <p className="text-[10px] text-muted-foreground">Scan QR or transfer manually</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* QR Code */}
                      <div className="rounded-lg bg-white p-2 flex flex-col items-center justify-center">
                        <div className="relative w-full aspect-square max-w-[160px]">
                          <Image
                            src={paymentMethod === "esewa" 
                              ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/esewa.jpg-qh3ZTwLcUhaic6z7mKCigVmHoXJrWR.jpeg"
                              : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bank.jpg-G9BCKBj2AKzrEbtAiObKQILNWm34LB.jpeg"
                            }
                            alt={`${selectedMethod.name} QR Code`}
                            fill
                            className="object-contain rounded-md"
                            sizes="160px"
                          />
                        </div>
                        <p className="text-[9px] text-gray-600 font-medium text-center mt-1.5">Scan to pay via {selectedMethod.name}</p>
                      </div>

                      {/* Payment details */}
                      <div className="space-y-2">
                        <div className="p-2 rounded-md bg-secondary/80 border border-border/50">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Amount</p>
                          <p className="text-base font-bold text-primary">NPR {subtotal.toLocaleString()}</p>
                        </div>
                        <div className="p-2 rounded-md bg-secondary/80 border border-border/50">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Account Name</p>
                          <p className="text-[11px] font-semibold text-foreground leading-snug">{selectedMethod.accountName}</p>
                        </div>
                        <div className="p-2 rounded-md bg-secondary/80 border border-border/50">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Account / ID</p>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-mono font-semibold text-foreground">{selectedMethod.accountId}</p>
                            <button onClick={() => copyToClipboard(selectedMethod.accountId, "account")} className="p-0.5 cursor-pointer">
                              {copiedField === "account" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Screenshot */}
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1.5 block">Payment Screenshot *</label>
                    {!screenshotPreview ? (
                      <button onClick={() => fileInputRef.current?.click()}
                        className="w-full py-7 border-2 border-dashed border-border rounded-lg flex flex-col items-center gap-1.5 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer group">
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-medium text-foreground">Click to upload screenshot</p>
                          <p className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</p>
                        </div>
                      </button>
                    ) : (
                      <div className="relative rounded-lg border border-border overflow-hidden bg-card animate-in fade-in duration-300">
                        <Image src={screenshotPreview} alt="Payment screenshot" width={400} height={300}
                          className="w-full h-44 object-contain bg-black/20" />
                        <button onClick={() => { setScreenshotFile(null); setScreenshotPreview(null) }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border cursor-pointer hover:bg-destructive hover:text-white transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                        <div className="p-2 flex items-center gap-2 border-t border-border">
                          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground truncate">{screenshotFile?.name}</span>
                        </div>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in duration-200">
                      <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <p className="text-[11px] text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => goToStep(2)}
                      className="px-4 py-2.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <button onClick={handlePlaceOrder} disabled={!step3Valid || submitting}
                      className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                      {submitting ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Placing Order...</>
                      ) : (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Place Order</>
                      )}
                    </button>
                  </div>
                </FadeIn>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-20 p-3.5 rounded-lg border border-border bg-card space-y-3">
                <h3 className="text-[12px] font-semibold text-foreground">Order Summary</h3>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {items.map(item => {
                    const price = getItemPrice(item)
                    const variant = getItemVariant(item)
                    return (
                      <div key={item.id} className="flex gap-2.5">
                        <div className="w-10 h-10 rounded-md bg-secondary border border-border/50 overflow-hidden shrink-0">
                          {item.product.image_url && (
                            <Image src={item.product.image_url} alt={item.product.name} width={40} height={40} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{item.product.name}</p>
                          {variant && <p className="text-[9px] text-muted-foreground truncate">{variant}</p>}
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[10px] text-muted-foreground">x{item.quantity}</span>
                            <span className="text-[11px] font-semibold text-foreground">NPR {(price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-border pt-2.5 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">NPR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[12px] font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">NPR {subtotal.toLocaleString()}</span>
                  </div>
                </div>
                {/* Progress summary */}
                <div className="border-t border-border pt-2.5 space-y-1.5">
                  {name && step >= 1 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <User className="w-3 h-3 shrink-0" /> <span className="truncate">{name}</span>
                    </div>
                  )}
                  {selectedMethod && step >= 2 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <PaymentLogo method={paymentMethod} size={14} /> <span>{selectedMethod.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
