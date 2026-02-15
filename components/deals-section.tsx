"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Flame, Sparkles, Clock, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface FeaturedProduct {
  id: string
  section_type: string
  display_order: number
  custom_label: string | null
  expires_at: string | null
  is_active: boolean
  bg_color: string | null
  bg_image: string | null
  bg_gradient: string | null
  products: {
    id: string
    name: string
    slug: string
    image_url: string | null
    base_price: number | null
    original_price: number | null
    product_type: string
    discount_percentage: number
    categories: { name: string } | null
  }
}

const DEFAULT_COLORS = ["#b45309", "#0369a1", "#1e293b", "#047857", "#be123c", "#6d28d9", "#c2410c", "#0e7490"]

function getCardStyle(item: FeaturedProduct, fallbackIdx: number): React.CSSProperties {
  if (item.bg_gradient) return { background: item.bg_gradient }
  if (item.bg_image) return { backgroundImage: `url(${item.bg_image})`, backgroundSize: "cover", backgroundPosition: "center" }
  if (item.bg_color) return { backgroundColor: item.bg_color }
  return { backgroundColor: DEFAULT_COLORS[fallbackIdx % DEFAULT_COLORS.length] }
}

export function DealsSection() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [dealProduct, setDealProduct] = useState<FeaturedProduct | null>(null)
  const [weeklyPicks, setWeeklyPicks] = useState<FeaturedProduct[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("featured_sections")
          .select("id, section_type, display_order, custom_label, expires_at, is_active, bg_color, bg_image, bg_gradient, products(id, name, slug, image_url, base_price, original_price, product_type, discount_percentage, categories(name))")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
        if (error) return
        const items = (data || []) as unknown as FeaturedProduct[]
        const now = new Date()
        const active = items.filter((i) => !i.expires_at || new Date(i.expires_at) > now)
        setDealProduct(active.find((i) => i.section_type === "deal_of_day") || null)
        setWeeklyPicks(active.filter((i) => i.section_type === "weekly_pick").slice(0, 8))
        const midnight = new Date(); midnight.setHours(24, 0, 0, 0)
        const diff = midnight.getTime() - now.getTime()
        setTimeLeft({ hours: Math.floor(diff / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) })
      } finally { setLoaded(true) }
    }
    load()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((p) => {
        if (p.seconds > 0) return { ...p, seconds: p.seconds - 1 }
        if (p.minutes > 0) return { ...p, minutes: p.minutes - 1, seconds: 59 }
        if (p.hours > 0) return { hours: p.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (loaded && !dealProduct && weeklyPicks.length === 0) return null

  return (
    <section className="py-8 sm:py-12 bg-background">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-6">

          {/* ─── Deal of the Day ─────────────────────────────────── */}
          {dealProduct && (
            <motion.div
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              className={weeklyPicks.length > 0 ? "lg:col-span-5" : "lg:col-span-12"}
            >
              <div className="bg-card border border-border rounded-2xl h-full overflow-hidden group hover:border-primary/30 transition-all duration-300">
                {/* Header with subtle flame animation */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Flame className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-foreground">Deal of the Day</h3>
                      <p className="text-[10px] text-muted-foreground">Ends at midnight</p>
                    </div>
                  </div>
                  {/* Countdown */}
                  <div className="flex items-center gap-1">
                    <TimeUnit value={timeLeft.hours} label="hr" />
                    <span className="text-primary font-bold text-[14px]">:</span>
                    <TimeUnit value={timeLeft.minutes} label="min" />
                    <span className="text-primary font-bold text-[14px]">:</span>
                    <TimeUnit value={timeLeft.seconds} label="sec" />
                  </div>
                </div>

                {/* Deal Card */}
                <div className="p-4 sm:p-5">
                  <Link href={`/product/${dealProduct.products.slug || dealProduct.products.id}`}>
                    <motion.div
                      className="relative rounded-xl overflow-hidden cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-44 sm:h-52 relative" style={getCardStyle(dealProduct, 0)}>
                        {/* Decorative circles */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

                        {/* Product Image */}
                        {dealProduct.products.image_url && (
                          <div className="absolute top-3 right-3 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-2xl">
                            <Image src={dealProduct.products.image_url} alt={dealProduct.products.name} width={96} height={96} className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          {dealProduct.products.discount_percentage > 0 && (
                            <span className="inline-block px-2.5 py-1 bg-red-500 text-white text-[11px] font-bold rounded-md mb-2 shadow-lg">
                              {dealProduct.products.discount_percentage}% OFF
                            </span>
                          )}
                          {dealProduct.custom_label && (
                            <span className="inline-block ml-1.5 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold rounded mb-2">
                              {dealProduct.custom_label}
                            </span>
                          )}
                          <h4 className="text-white font-bold text-lg sm:text-xl leading-tight drop-shadow-md">{dealProduct.products.name}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-white font-bold text-lg">NPR {dealProduct.products.base_price?.toLocaleString()}</span>
                            {dealProduct.products.original_price && dealProduct.products.original_price > (dealProduct.products.base_price || 0) && (
                              <span className="text-white/50 line-through text-sm">NPR {dealProduct.products.original_price.toLocaleString()}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 text-white/80 text-[12px] font-medium">
                            <span>Shop Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>New deals added every day</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Weekly Picks ────────────────────────────────────── */}
          {weeklyPicks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.08 }}
              className={dealProduct ? "lg:col-span-7" : "lg:col-span-12"}
            >
              <div className="bg-card border border-border rounded-2xl h-full overflow-hidden hover:border-primary/30 transition-all duration-300">
                <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-foreground">Weekly Picks</h3>
                      <p className="text-[10px] text-muted-foreground">Hand-picked for you</p>
                    </div>
                  </div>
                  <Link href="/store" className="text-[11px] text-primary font-semibold flex items-center gap-1 hover:underline">
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {weeklyPicks.map((pick, index) => (
                      <motion.div
                        key={pick.id}
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.25, delay: index * 0.04 }}
                      >
                        <Link href={`/product/${pick.products.slug || pick.products.id}`} className="cursor-pointer group block">
                          <motion.div
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-xl overflow-hidden relative h-[120px] sm:h-[130px] shadow-sm hover:shadow-xl transition-shadow duration-300"
                            style={getCardStyle(pick, index)}
                          >
                            {/* Decorative overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/5 rounded-full" />

                            {/* Product thumbnail */}
                            {pick.products.image_url && (
                              <div className="absolute top-2.5 right-2.5 w-10 h-10 rounded-lg overflow-hidden ring-1 ring-white/20 opacity-70 group-hover:opacity-100 transition-opacity shadow-md">
                                <Image src={pick.products.image_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                              </div>
                            )}

                            {/* Discount badge */}
                            {pick.products.discount_percentage > 0 && (
                              <div className="absolute top-2 left-2">
                                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded shadow-sm">
                                  -{pick.products.discount_percentage}%
                                </span>
                              </div>
                            )}

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              {pick.custom_label && (
                                <span className="inline-block px-1.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[8px] font-bold rounded mb-1">
                                  {pick.custom_label}
                                </span>
                              )}
                              <h4 className="text-white font-bold text-[13px] leading-tight truncate drop-shadow-md">{pick.products.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-white font-semibold text-[12px] drop-shadow-sm">
                                  NPR {pick.products.base_price?.toLocaleString()}
                                </span>
                                {pick.products.original_price && pick.products.original_price > (pick.products.base_price || 0) && (
                                  <span className="text-white/40 line-through text-[10px]">
                                    {pick.products.original_price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

/* Countdown time unit */
function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-primary-foreground text-[16px] font-bold w-10 h-9 flex items-center justify-center rounded-lg amber-glow-sm">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[8px] text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</span>
    </div>
  )
}
