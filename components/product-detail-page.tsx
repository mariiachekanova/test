'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart, Copy, Check, Star, Zap, Globe,
  Truck, RotateCcw, Shield, ChevronDown, Monitor, Gamepad2, Clock, User, Trash2, Send,
} from 'lucide-react'
import type { Product, SubscriptionPlan, PlanDuration, Denomination, FAQ, Review } from '@/lib/data'
import { getReviews, getReviewStats, submitReview, deleteReview } from '@/lib/data'
import { Breadcrumb } from '@/components/breadcrumb'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { triggerCartNotification } from '@/components/cart-notification'

interface ProductDetailPageProps {
  product: Product
  initialReviews?: Array<Record<string, unknown>>
  initialReviewStats?: { avg: number; count: number }
}

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'faqs', label: 'FAQ' },
  { id: 'specifications', label: 'Specs' },
  { id: 'reviews', label: 'Reviews' },
]

export default function ProductDetailPage({ product, initialReviews, initialReviewStats }: ProductDetailPageProps) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const [activeTab, setActiveTab] = useState('description')
  const [cartAdded, setCartAdded] = useState(false)
  const [copied, setCopied] = useState(false)

  // Subscription state
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    product.plans?.[0] || null
  )
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration | null>(
    product.plans?.[0]?.durations?.[0] || null
  )

  // Gift card state
  const [selectedDenom, setSelectedDenom] = useState<Denomination | null>(
    product.denominations?.[0] || null
  )

  // Reviews state -- seed from server-provided initial data, then refresh client-side
  const [reviews, setReviews] = useState<Review[]>(
    () => (initialReviews || []).map(r => ({
      id: r.id as string,
      product_id: r.product_id as string,
      user_id: (r.user_id as string) || '',
      rating: r.rating as number,
      title: (r.title as string) || null,
      body: (r.body as string) || null,
      created_at: r.created_at as string,
      updated_at: (r.updated_at as string) || r.created_at as string,
      profile: r.profile as Review['profile'] || null,
    }))
  )
  const [reviewStats, setReviewStats] = useState(initialReviewStats || { avg: 0, count: 0 })
  const [reviewLoading, setReviewLoading] = useState(!initialReviews)

  useEffect(() => {
    // If we already have server data, just do a background refresh
    async function loadReviews() {
      if (!initialReviews) setReviewLoading(true)
      const [r, s] = await Promise.all([
        getReviews(product.id),
        getReviewStats(product.id),
      ])
      setReviews(r)
      setReviewStats(s)
      setReviewLoading(false)
    }
    loadReviews()
  }, [product.id, initialReviews])

  const outOfStock = product.stock_quantity === 0
  const discountPercent = product.discount_percentage || 0

  // Compute effective price based on product type and selections
  let effectivePrice = product.base_price
  let originalPrice: number | undefined = product.original_price && product.original_price > 0 ? product.original_price : undefined

  if (product.product_type === 'subscription' && selectedDuration) {
    effectivePrice = selectedDuration.price
    originalPrice = selectedDuration.original_price && selectedDuration.original_price > selectedDuration.price ? selectedDuration.original_price : undefined
  } else if (product.product_type === 'gift_card' && selectedDenom) {
    effectivePrice = selectedDenom.amount
    originalPrice = selectedDenom.original_price && selectedDenom.original_price > selectedDenom.amount ? selectedDenom.original_price : undefined
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddToCart = async () => {
    if (outOfStock || adding) return
    setAdding(true)

    // 1s delay for a satisfying spinner feel
    await new Promise(r => setTimeout(r, 1000))

    const success = addToCart({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug || product.id,
        image_url: product.image_url,
        base_price: product.base_price,
        original_price: product.original_price,
        product_type: product.product_type,
        category_name: product.category?.name,
      },
      plan: selectedPlan ? { id: selectedPlan.id, plan_name: selectedPlan.plan_name } : null,
      duration: selectedDuration ? { id: selectedDuration.id, duration_name: selectedDuration.duration_name, price: selectedDuration.price, original_price: selectedDuration.original_price } : null,
      denomination: selectedDenom ? { id: selectedDenom.id, amount: selectedDenom.amount, original_price: selectedDenom.original_price } : null,
      quantity,
    })

    setAdding(false)

    if (success) {
      setCartAdded(true)
      setTimeout(() => setCartAdded(false), 2000)

      const variantParts: string[] = []
      if (selectedPlan) variantParts.push(selectedPlan.plan_name)
      if (selectedDuration) variantParts.push(selectedDuration.duration_name)
      if (selectedDenom) variantParts.push(`NPR ${selectedDenom.amount.toLocaleString()}`)
      if (quantity > 1) variantParts.push(`Qty: ${quantity}`)

      triggerCartNotification({
        name: product.name,
        image: product.image_url || '/placeholder.svg',
        price: effectivePrice * quantity,
        variant: variantParts.length > 0 ? variantParts.join(' / ') : undefined,
      })
    }
  }

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setSelectedDuration(plan.durations?.[0] || null)
  }

  const handleReviewSubmitted = (review: Review) => {
    setReviews(prev => [review, ...prev])
    const newCount = reviewStats.count + 1
    const newAvg = Math.round(((reviewStats.avg * reviewStats.count + review.rating) / newCount) * 10) / 10
    setReviewStats({ avg: newAvg, count: newCount })
  }

  const handleReviewDeleted = (reviewId: string) => {
    const deleted = reviews.find(r => r.id === reviewId)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
    if (deleted) {
      const newCount = reviewStats.count - 1
      const newAvg = newCount > 0 ? Math.round(((reviewStats.avg * reviewStats.count - deleted.rating) / newCount) * 10) / 10 : 0
      setReviewStats({ avg: newAvg, count: newCount })
    }
  }

  const renderStars = (rating: number, size = 12) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={size}
        className={`${i < Math.floor(rating) ? 'fill-primary text-primary' : i < rating ? 'fill-primary/50 text-primary/50' : 'text-muted-foreground/30'}`} />
    ))

  return (
  <div>
  <Breadcrumb items={[
  { label: "Store", href: "/store" },
        ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.slug}` }] : []),
        { label: product.name },
      ]} />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
          {/* Left: Image */}
          <div className="flex flex-col gap-2">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-border/60 bg-secondary">
              <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
              {discountPercent > 0 && !outOfStock && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-red-500 shadow-sm">{'-'}{discountPercent}%</span>
              )}
              {outOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="px-3 py-1.5 rounded-lg text-xs text-white font-semibold bg-muted/80">Out of Stock</span>
                </div>
              )}
            </div>
            {product.gallery_images && product.gallery_images.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto">
                {product.gallery_images.slice(0, 5).map((img, i) => (
                  <div key={i} className="relative w-14 h-14 rounded-md overflow-hidden border border-border/40 bg-secondary flex-shrink-0">
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-2.5">
            {/* Category & Stock */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{product.category?.name || product.product_type.replace('_', ' ')}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${outOfStock ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {outOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-snug text-balance">{product.name}</h1>

            {/* Short description ABOVE price */}
            {product.short_description && (
              <p className="text-[11px] text-muted-foreground leading-relaxed">{product.short_description}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
              <div className="flex items-center gap-0.5">{renderStars(reviewStats.avg)}</div>
              <span className="text-[11px] font-medium text-primary">{reviewStats.avg > 0 ? reviewStats.avg : '--'}</span>
              <span className="text-[10px] text-muted-foreground">({reviewStats.count} review{reviewStats.count !== 1 ? 's' : ''})</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 py-0.5">
              <span className="text-xl font-bold text-primary">NPR {effectivePrice.toLocaleString()}</span>
              {originalPrice && originalPrice > effectivePrice && (
                <>
                  <span className="text-xs text-muted-foreground line-through">NPR {originalPrice.toLocaleString()}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-red-500">
                    {'-'}{Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.map(tag => (
                  <span key={tag.id} className="px-2 py-0.5 text-[9px] font-medium bg-secondary rounded-full text-muted-foreground border border-border/40">{tag.name}</span>
                ))}
              </div>
            )}

            {/* ─── Subscription Plans ─── */}
            {product.product_type === 'subscription' && product.plans && product.plans.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Select Plan</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {product.plans.map(plan => (
                    <button key={plan.id} onClick={() => handlePlanSelect(plan)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${selectedPlan?.id === plan.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/60 bg-card hover:border-muted-foreground/20'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-foreground">{plan.plan_name}</span>
                        {selectedPlan?.id === plan.id && <Check className="w-3 h-3 text-primary" />}
                      </div>
                      {plan.description && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{plan.description}</p>}
                      {/* Show durations count */}
                      {plan.durations && plan.durations.length > 0 && (
                        <span className="text-[9px] text-primary/70 mt-0.5 block">{plan.durations.filter(d => d.is_active).length} duration option{plan.durations.filter(d => d.is_active).length !== 1 ? 's' : ''} available</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Durations for selected plan */}
                {selectedPlan?.durations && selectedPlan.durations.filter(d => d.is_active).length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Select Duration
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {selectedPlan.durations.filter(d => d.is_active).map(dur => (
                        <button key={dur.id} onClick={() => setSelectedDuration(dur)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${selectedDuration?.id === dur.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/60 bg-card hover:border-muted-foreground/20'}`}>
                          <span className="text-[11px] font-semibold text-foreground block">{dur.duration_name}</span>
                          {dur.original_price > 0 && dur.original_price > dur.price && (
                            <span className="text-[9px] text-muted-foreground line-through block">NPR {dur.original_price.toLocaleString()}</span>
                          )}
                          <span className="text-[12px] font-bold text-primary block mt-0.5">NPR {dur.price.toLocaleString()}</span>
                          {dur.discount_percentage > 0 && (
                            <span className="text-[9px] text-emerald-400 font-medium block">-{dur.discount_percentage}% off</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Gift Card Denominations ─── */}
            {product.product_type === 'gift_card' && product.denominations && product.denominations.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Select Amount</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {product.denominations.filter(d => d.is_active).map(denom => (
                    <button key={denom.id} onClick={() => setSelectedDenom(denom)}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${selectedDenom?.id === denom.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/60 bg-card hover:border-muted-foreground/20'}`}>
                      {denom.original_price > 0 && denom.original_price > denom.amount && (
                        <span className="text-[9px] text-muted-foreground line-through block">NPR {denom.original_price.toLocaleString()}</span>
                      )}
                      <span className="text-[11px] font-bold text-foreground">NPR {denom.amount.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Game Metadata ─── */}
            {product.product_type === 'game' && product.game_meta && (
              <div className="space-y-1.5 pt-1 text-[10px]">
                {product.game_meta.platform && product.game_meta.platform.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Monitor className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-muted-foreground">Platform:</span>
                    {product.game_meta.platform.map(p => (
                      <span key={p} className="px-1.5 py-0.5 text-[9px] font-medium bg-secondary rounded text-foreground border border-border/40">{p}</span>
                    ))}
                  </div>
                )}
                {product.game_meta.genre && product.game_meta.genre.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Gamepad2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-muted-foreground">Genre:</span>
                    {product.game_meta.genre.map(g => (
                      <span key={g} className="px-1.5 py-0.5 text-[9px] font-medium bg-secondary rounded text-foreground border border-border/40">{g}</span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1.5">
                  {product.game_meta.developer && (
                    <div className="flex gap-1"><span className="text-muted-foreground">Developer:</span><span className="text-foreground font-medium">{product.game_meta.developer}</span></div>
                  )}
                  {product.game_meta.publisher && (
                    <div className="flex gap-1"><span className="text-muted-foreground">Publisher:</span><span className="text-foreground font-medium">{product.game_meta.publisher}</span></div>
                  )}
                  {product.game_meta.release_date && (
                    <div className="flex gap-1"><span className="text-muted-foreground">Released:</span><span className="text-foreground font-medium">{product.game_meta.release_date}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity & Cart */}
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <div className="flex items-center border border-border/60 rounded-lg bg-card">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors font-bold cursor-pointer rounded-l-lg" disabled={outOfStock}>{'−'}</button>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center py-1.5 border-x border-border/60 outline-none w-10 bg-transparent text-xs font-semibold text-foreground" disabled={outOfStock} />
                  <button onClick={() => setQuantity(quantity + 1)} className="px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors font-bold cursor-pointer rounded-r-lg" disabled={outOfStock}>+</button>
                </div>
                <button onClick={handleAddToCart} disabled={outOfStock || adding}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${cartAdded ? 'bg-emerald-500 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}>
                  {adding ? (<><span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /><span>Adding...</span></>) : cartAdded ? (<><Check className="w-3.5 h-3.5" /><span>Added</span></>) : (<><ShoppingCart className="w-3.5 h-3.5" /><span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span></>)}
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={handleCopyLink}
                  className="flex-1 py-1.5 border border-border/60 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all text-xs font-medium cursor-pointer flex items-center justify-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-foreground">{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/40">
              <div className="flex items-center gap-1.5 p-2 bg-emerald-500/5 rounded-md border border-emerald-500/10">
                <Zap className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-[9px] font-medium text-emerald-400">Instant Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-blue-500/5 rounded-md border border-blue-500/10">
                <Globe className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span className="text-[9px] font-medium text-blue-400">Worldwide</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-primary/5 rounded-md border border-primary/10">
                <Shield className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[9px] font-medium text-primary">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div className="p-3 bg-card rounded-lg border border-border/60 flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/10 rounded-md"><Truck className="w-3.5 h-3.5 text-emerald-400" /></div>
            <div><h3 className="font-semibold text-foreground text-[11px]">Free Delivery</h3><p className="text-[9px] text-muted-foreground">No hidden charges</p></div>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border/60 flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/10 rounded-md"><RotateCcw className="w-3.5 h-3.5 text-blue-400" /></div>
            <div><h3 className="font-semibold text-foreground text-[11px]">Easy Returns</h3><p className="text-[9px] text-muted-foreground">30-day guarantee</p></div>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border/60 flex items-center gap-2.5">
            <div className="p-1.5 bg-primary/10 rounded-md"><Shield className="w-3.5 h-3.5 text-primary" /></div>
            <div><h3 className="font-semibold text-foreground text-[11px]">Secure Payment</h3><p className="text-[9px] text-muted-foreground">SSL encrypted</p></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-xl border border-border/60 p-4 sm:p-5 mb-8">
          <div className="flex gap-0.5 border-b border-border/40 overflow-x-auto mb-5">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer relative ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {tab.label}
                {tab.id === 'reviews' && reviewStats.count > 0 && (
                  <span className="ml-1 text-[9px] text-primary/70">({reviewStats.count})</span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'description' && (
              <div className="p-3 bg-secondary/50 rounded-lg border border-border/40">
                {product.long_description ? (
                  <div className="text-[12px] text-muted-foreground leading-relaxed prose-sm" dangerouslySetInnerHTML={{ __html: product.long_description }} />
                ) : (
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{product.short_description || `${product.name} - available for instant digital delivery.`}</p>
                )}
              </div>
            )}
            {activeTab === 'faqs' && (
              <div className="space-y-2">
                {product.faqs && product.faqs.length > 0 ? product.faqs.map((faq, idx) => (
                  <FAQItem key={faq.id} faq={faq} defaultOpen={idx === 0} />
                )) : (
                  <p className="text-[12px] text-muted-foreground py-4 text-center">No FAQs available for this product.</p>
                )}
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="space-y-1.5">
                <SpecRow label="Product Type" value={product.product_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} />
                <SpecRow label="Category" value={product.category?.name || 'N/A'} />
                <SpecRow label="SKU" value={product.sku || 'N/A'} />
                <SpecRow label="Delivery" value="Instant Digital" />
                <SpecRow label="Status" value={product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'} />
                {product.denominations && product.denominations.length > 0 && (
                  <SpecRow label="Denominations" value={product.denominations.map(d => `NPR ${d.amount.toLocaleString()}`).join(', ')} />
                )}
                {product.plans && product.plans.length > 0 && (
                  <SpecRow label="Plans" value={product.plans.map(p => p.plan_name).join(', ')} />
                )}
                {product.game_meta?.developer && <SpecRow label="Developer" value={product.game_meta.developer} />}
                {product.game_meta?.publisher && <SpecRow label="Publisher" value={product.game_meta.publisher} />}
                {product.game_meta?.platform && product.game_meta.platform.length > 0 && (
                  <SpecRow label="Platforms" value={product.game_meta.platform.join(', ')} />
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <ReviewsSection
                productId={product.id}
                reviews={reviews}
                stats={reviewStats}
                loading={reviewLoading}
                userId={user?.id || null}
                onReviewSubmitted={handleReviewSubmitted}
                onReviewDeleted={handleReviewDeleted}
              />
            )}
          </div>
        </div>

        {/* Related Products */}
        {product._related && product._related.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-foreground mb-4">You might also <span className="text-primary">like</span></h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {product._related.map((rel) => (
                <Link key={rel.id} href={`/product/${rel.slug || rel.id}`}
                  className="block p-2.5 bg-card border border-border/60 rounded-lg hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 cursor-pointer group">
                  <div className="relative w-full aspect-square mb-2 rounded-md overflow-hidden bg-secondary">
                    <Image src={rel.image_url || "/placeholder.svg"} alt={rel.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                  <h3 className="font-semibold text-[11px] text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">{rel.name}</h3>
                  <span className="font-bold text-[11px] text-primary">NPR {rel.base_price.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Reviews Section ─────────────────────────────────────────────────

function ReviewsSection({
  productId, reviews, stats, loading, userId, onReviewSubmitted, onReviewDeleted,
}: {
  productId: string
  reviews: Review[]
  stats: { avg: number; count: number }
  loading: boolean
  userId: string | null
  onReviewSubmitted: (r: Review) => void
  onReviewDeleted: (id: string) => void
}) {
  const userHasReview = userId ? reviews.some(r => r.user_id === userId) : false

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg border border-border/40">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.avg > 0 ? stats.avg : '--'}</div>
          <div className="flex items-center gap-0.5 justify-center mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10} className={i < Math.round(stats.avg) ? 'fill-primary text-primary' : 'text-muted-foreground/30'} />
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{stats.count} review{stats.count !== 1 ? 's' : ''}</div>
        </div>
        <div className="flex-1 space-y-0.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length
            const pct = stats.count > 0 ? (count / stats.count) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground w-3 text-right">{star}</span>
                <Star size={8} className="fill-primary text-primary" />
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground w-4 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Write review form */}
      {userId && !userHasReview ? (
        <ReviewForm productId={productId} userId={userId} onSubmitted={onReviewSubmitted} />
      ) : !userId ? (
        <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 text-center">
          <p className="text-[11px] text-muted-foreground">
            <Link href="/account/signin" className="text-primary hover:underline font-medium">Sign in</Link> to leave a review.
          </p>
        </div>
      ) : null}

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/40 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-secondary rounded-full" />
                <div className="h-3 w-24 bg-secondary rounded" />
                <div className="h-2 w-16 bg-secondary rounded ml-auto" />
              </div>
              <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_, j) => <div key={j} className="w-2.5 h-2.5 bg-secondary rounded" />)}</div>
              <div className="h-2.5 w-full bg-secondary rounded mb-1" />
              <div className="h-2.5 w-3/4 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-2">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} isOwn={review.user_id === userId} onDelete={onReviewDeleted} />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground py-6 text-center">No reviews yet. Be the first to review this product.</p>
      )}
    </div>
  )
}

// ─── Review Form ─────────────────────────────────────────────────────

function ReviewForm({ productId, userId, onSubmitted }: { productId: string; userId: string; onSubmitted: (r: Review) => void }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating'); return }
    setError('')
    setSubmitting(true)
    try {
      const review = await submitReview(productId, userId, rating, title, body)
      if (review) {
        onSubmitted(review as Review)
        setRating(0)
        setTitle('')
        setBody('')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-card rounded-lg border border-border/60 space-y-2.5">
      <h4 className="text-[11px] font-semibold text-foreground">Write a Review</h4>

      {/* Star picker */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground mr-1">Rating:</span>
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="cursor-pointer p-0.5">
            <Star size={16} className={`transition-colors ${star <= (hoverRating || rating) ? 'fill-primary text-primary' : 'text-muted-foreground/30 hover:text-primary/50'}`} />
          </button>
        ))}
        {rating > 0 && <span className="text-[10px] text-primary font-medium ml-1">{rating}/5</span>}
      </div>

      <input
        type="text" value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="w-full px-2.5 py-1.5 text-[11px] bg-secondary/50 border border-border/40 rounded-md outline-none focus:border-primary/40 text-foreground placeholder:text-muted-foreground/50"
      />
      <textarea
        value={body} onChange={e => setBody(e.target.value)}
        placeholder="Share your experience with this product..."
        rows={3}
        className="w-full px-2.5 py-1.5 text-[11px] bg-secondary/50 border border-border/40 rounded-md outline-none focus:border-primary/40 text-foreground placeholder:text-muted-foreground/50 resize-none"
      />

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      <button type="submit" disabled={submitting || rating === 0}
        className="px-4 py-1.5 bg-primary text-primary-foreground text-[11px] font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5">
        <Send className="w-3 h-3" />
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

// ─── Review Card ─────────────────────────────────────────────────────

function ReviewCard({ review, isOwn, onDelete }: { review: Review; isOwn: boolean; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this review?')) return
    setDeleting(true)
    try {
      await deleteReview(review.id)
      onDelete(review.id)
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  const displayName = review.profile?.full_name || 'Anonymous'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const timeAgo = getTimeAgo(review.created_at)

  return (
    <div className="p-3 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/40 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {review.profile?.avatar_url ? (
            <Image src={review.profile.avatar_url} alt="" width={20} height={20} className="rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary">{initials}</span>
            </div>
          )}
          <span className="text-[11px] font-semibold text-foreground">{displayName}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={9} className={i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground">{timeAgo}</span>
          {isOwn && (
            <button onClick={handleDelete} disabled={deleting}
              className="p-1 hover:bg-red-500/10 rounded transition-colors cursor-pointer disabled:opacity-50">
              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" />
            </button>
          )}
        </div>
      </div>
      {review.title && <p className="text-[11px] font-semibold text-foreground mb-0.5">{review.title}</p>}
      {review.body && <p className="text-[11px] text-muted-foreground leading-relaxed">{review.body}</p>}
    </div>
  )
}

// ─── Helper Components ───────────────────────────────────────────────

function FAQItem({ faq, defaultOpen = false }: { faq: FAQ; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border/40 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-2.5 text-left cursor-pointer hover:bg-secondary/50 transition-colors">
        <span className="text-[12px] font-semibold text-foreground">{faq.question}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-2.5 pb-2.5">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2 bg-secondary/50 rounded-md border border-border/30">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <span className="col-span-2 text-[11px] text-foreground">{value}</span>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const d = new Date(dateStr).getTime()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
