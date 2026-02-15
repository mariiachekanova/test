"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { useCart, type CartItem } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Zap } from "lucide-react"

function CartItemRow({ item, onUpdate, onRemove }: {
  item: CartItem
  onUpdate: (id: string, q: number) => void
  onRemove: (id: string) => void
}) {
  let price = item.product.base_price
  let originalPrice: number | undefined
  let variantLabel = ""

  if (item.duration) {
    price = item.duration.price
    originalPrice = item.duration.original_price > item.duration.price ? item.duration.original_price : undefined
    variantLabel = [item.plan?.plan_name, item.duration.duration_name].filter(Boolean).join(" - ")
  } else if (item.denomination) {
    price = item.denomination.amount
    originalPrice = item.denomination.original_price > item.denomination.amount ? item.denomination.original_price : undefined
    variantLabel = `NPR ${item.denomination.amount.toLocaleString()} card`
  } else {
    originalPrice = item.product.original_price > price ? item.product.original_price : undefined
  }

  const lineTotal = price * item.quantity

  return (
    <div className="flex gap-3 py-3 border-b border-border/40 last:border-0">
      <Link href={`/product/${item.product.slug || item.product_id}`} className="shrink-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary border border-border/40">
          <Image
            src={item.product.image_url || "/placeholder.svg"}
            alt={item.product.name}
            width={80} height={80}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.product.slug || item.product_id}`} className="text-[12px] sm:text-[13px] font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
          {item.product.name}
        </Link>

        {item.product.category_name && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{item.product.category_name}</p>
        )}
        {variantLabel && (
          <p className="text-[10px] text-primary/80 font-medium mt-0.5">{variantLabel}</p>
        )}

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-[12px] font-bold text-primary">NPR {price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-[10px] text-muted-foreground line-through">NPR {originalPrice.toLocaleString()}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-border/60 rounded-md overflow-hidden">
            <button onClick={() => onUpdate(item.id, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 h-7 flex items-center justify-center text-[11px] font-semibold text-foreground border-x border-border/60 bg-secondary/30">
              {item.quantity}
            </span>
            <button onClick={() => onUpdate(item.id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-foreground">NPR {lineTotal.toLocaleString()}</span>
            <button onClick={() => onRemove(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border/40 flex items-center justify-center mb-4">
        <ShoppingBag className="w-7 h-7 text-muted-foreground" />
      </div>
      <h2 className="text-[15px] font-semibold text-foreground mb-1">Your cart is empty</h2>
      <p className="text-[12px] text-muted-foreground max-w-[240px] mb-5">
        Browse our store and add products to your cart to get started.
      </p>
      <Link href="/store"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90 transition-colors">
        Browse Store
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-secondary/60 rounded-lg ${className}`} />
}

function CheckoutSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Steps progress bar */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Shimmer className="w-7 h-7 rounded-full" />
              <Shimmer className="w-16 h-3 hidden sm:block" />
            </div>
            {i < 3 && <Shimmer className="w-8 h-0.5 rounded" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main form area */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border/40 rounded-xl p-5">
            <Shimmer className="w-40 h-4 mb-5" />
            <div className="space-y-4">
              <div>
                <Shimmer className="w-20 h-3 mb-1.5" />
                <Shimmer className="w-full h-10 rounded-lg" />
              </div>
              <div>
                <Shimmer className="w-16 h-3 mb-1.5" />
                <Shimmer className="w-full h-10 rounded-lg" />
              </div>
              <div>
                <Shimmer className="w-24 h-3 mb-1.5" />
                <Shimmer className="w-full h-10 rounded-lg" />
              </div>
              <div>
                <Shimmer className="w-28 h-3 mb-1.5" />
                <Shimmer className="w-full h-20 rounded-lg" />
              </div>
            </div>
            <Shimmer className="w-full h-10 rounded-lg mt-6" />
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3">
            <Shimmer className="w-28 h-4 mb-3" />
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 py-2.5 border-b border-border/30 last:border-0">
                <Shimmer className="w-12 h-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Shimmer className="w-3/4 h-3" />
                  <Shimmer className="w-1/2 h-2.5" />
                  <Shimmer className="w-20 h-3" />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border/30 space-y-2">
              <div className="flex justify-between">
                <Shimmer className="w-16 h-3" />
                <Shimmer className="w-20 h-3" />
              </div>
              <div className="flex justify-between">
                <Shimmer className="w-14 h-3" />
                <Shimmer className="w-12 h-3" />
              </div>
            </div>
            <div className="pt-2 border-t border-border/30 flex justify-between">
              <Shimmer className="w-12 h-4" />
              <Shimmer className="w-24 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const router = useRouter()
  const { items, count, updateQuantity, removeFromCart, clearCart, getSubtotal } = useCart()
  const [clearing, setClearing] = useState(false)
  const [navigating, setNavigating] = useState(false)

  const subtotal = getSubtotal()

  const handleCheckout = () => {
    setNavigating(true)
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Breadcrumb items={[{ label: "Cart" }]} />

      <main className="flex-1 py-6 lg:py-8">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[16px] sm:text-[18px] font-bold text-foreground">Shopping Cart</h1>
              {count > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{count} {count === 1 ? 'item' : 'items'}</p>
              )}
            </div>
            {count > 0 && (
              <button
                onClick={() => { setClearing(true); clearCart(); setClearing(false) }}
                disabled={clearing}
                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer disabled:opacity-50">
                Clear all
              </button>
            )}
          </div>

          {navigating ? (
            <CheckoutSkeleton />
          ) : count === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-card border border-border/40 rounded-xl p-3 sm:p-4">
                  {items.map(item => (
                    <CartItemRow key={item.id} item={item} onUpdate={updateQuantity} onRemove={removeFromCart} />
                  ))}
                </div>
                <Link href="/store" className="inline-flex items-center gap-1.5 mt-4 text-[11px] text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  Continue Shopping
                </Link>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-card border border-border/40 rounded-xl p-4 sticky top-4">
                  <h3 className="text-[13px] font-bold text-foreground mb-3 pb-2.5 border-b border-border/40">Order Summary</h3>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({count} {count === 1 ? 'item' : 'items'})</span>
                      <span className="font-semibold text-foreground">NPR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium text-emerald-400">Instant</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/40 flex justify-between items-baseline">
                    <span className="text-[12px] font-semibold text-foreground">Total</span>
                    <span className="text-[16px] font-bold text-primary">NPR {subtotal.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={navigating}
                    className="w-full mt-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Zap className="w-3 h-3 text-primary/60" />
                      Instant digital delivery
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <ShieldCheck className="w-3 h-3 text-primary/60" />
                      Secure checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
