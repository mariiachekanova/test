"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, X, ArrowRight, Grid2X2, Package, Gift, Gamepad2, Zap } from "lucide-react"
import { ProductGridSkeleton } from "@/components/skeletons"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getProducts, type Product } from "@/lib/data"

type FilterTab = "all" | "product" | "gift_card" | "game"

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  useEffect(() => {
    async function load() {
      try {
        const prods = await getProducts({ limit: 100 })
        setAllProducts(prods)
      } catch (e) {
        console.error("[v0] SearchPage load error:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let results = allProducts
    if (query.trim()) {
      const q = query.toLowerCase()
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q) ||
          (p.short_description || "").toLowerCase().includes(q)
      )
    }
    if (activeTab === "gift_card") {
      results = results.filter((p) => p.product_type === "gift_card")
    } else if (activeTab === "game") {
      results = results.filter((p) => p.product_type === "game")
    } else if (activeTab === "product") {
      results = results.filter((p) => p.product_type === "subscription")
    }
    return results
  }, [query, allProducts, activeTab])

  // Counts for tabs
  const counts = useMemo(() => {
    let base = allProducts
    if (query.trim()) {
      const q = query.toLowerCase()
      base = base.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q) ||
          (p.short_description || "").toLowerCase().includes(q)
      )
    }
    return {
      all: base.length,
      product: base.filter((p) => p.product_type === "subscription").length,
      gift_card: base.filter((p) => p.product_type === "gift_card").length,
      game: base.filter((p) => p.product_type === "game").length,
    }
  }, [query, allProducts])

  const tabs: { key: FilterTab; label: string; icon: typeof Grid2X2; count: number }[] = [
    { key: "all", label: "All", icon: Grid2X2, count: counts.all },
    { key: "product", label: "Products", icon: Package, count: counts.product },
    { key: "gift_card", label: "Gift Cards", icon: Gift, count: counts.gift_card },
    { key: "game", label: "Games", icon: Gamepad2, count: counts.game },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8 lg:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center text-[22px] sm:text-[28px] lg:text-[34px] font-bold text-foreground mb-6 sm:mb-8 text-balance"
          >
            Search Products
          </motion.h1>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="max-w-2xl mx-auto mb-2"
          >
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for gift cards, subscriptions..."
                  autoFocus
                  className="w-full h-12 sm:h-[52px] pl-12 pr-12 bg-card border border-border rounded-xl sm:rounded-2xl text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
              <button className="h-12 sm:h-[52px] w-12 sm:w-[52px] shrink-0 bg-card border border-border rounded-xl sm:rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all cursor-pointer">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-center text-[13px] text-muted-foreground mb-6 sm:mb-8"
          >
            Search across products, gift cards, and more
          </motion.p>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-8 sm:mb-10 -mx-4 sm:mx-0 px-4 sm:px-0"
          >
            <div className="flex items-center sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[13px] font-semibold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{tab.label}</span>
                    <span
                      className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold leading-none ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Results */}
          {loading ? (
            <ProductGridSkeleton count={10} />
          ) : filtered.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {filtered.map((product, i) => {
                const discountPercent =
                  product.original_price > 0 && product.original_price > product.base_price
                    ? Math.round(((product.original_price - product.base_price) / product.original_price) * 100)
                    : null
                const isSubscription = product.product_type === "subscription"

                return (
                  <motion.div key={product.id} variants={fadeUp} custom={i}>
                    <Link
                      href={`/product/${product.slug || product.id}`}
                      className="block rounded-xl sm:rounded-2xl overflow-hidden bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer h-full"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
                          sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 25vw"
                        />

                        {/* Top-left badges */}
                        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1">
                          {discountPercent && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold text-white bg-red-500 leading-tight shadow-sm">
                              {discountPercent}% OFF
                            </span>
                          )}
                          {isSubscription && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold text-primary-foreground bg-primary leading-tight shadow-sm uppercase tracking-wide">
                              Subscription
                            </span>
                          )}
                        </div>

                        {/* Instant delivery badge */}
                        {product.stock_quantity > 0 && (
                          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-[8px] sm:text-[9px] font-semibold text-primary leading-tight">
                              <Zap className="w-2.5 h-2.5 fill-current" />
                              Instant
                            </span>
                          </div>
                        )}

                        {/* Bottom gradient overlay for readability */}
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-3.5 flex flex-col gap-1">
                        {/* Category */}
                        <span className="text-[9px] sm:text-[10px] text-primary/80 uppercase tracking-wider font-semibold truncate">
                          {product.category?.name || product.product_type?.replace("_", " ")}
                        </span>

                        {/* Name */}
                        <h3 className="text-[12px] sm:text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 mt-1 pt-2 border-t border-border/40">
                          <span className="text-[13px] sm:text-[15px] font-bold text-primary">
                            NPR {product.base_price.toLocaleString()}
                          </span>
                          {product.original_price > 0 && product.original_price > product.base_price && (
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground line-through">
                              NPR {product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-[16px] font-semibold text-foreground">No results found</p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-xs">
                {"We couldn't find anything matching your search. Try different keywords."}
              </p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
