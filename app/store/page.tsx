"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  ChevronDown, Grid3X3, LayoutGrid, Package, Gift, Gamepad2, Layers, ArrowUpDown,
  Search, Zap, Shield, Clock, CheckCircle2, Sparkles, TrendingUp,
} from "lucide-react"
import { ProductGridSkeleton, CategoriesGridSkeleton } from "@/components/skeletons"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { getProducts, getCategories, type Product, type Category } from "@/lib/data"
import { useSearchParams } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import Image from "next/image"
import Link from "next/link"

type ProductTypeTab = "all" | "subscription" | "gift_card" | "game"
type SortOption = "default" | "price_low" | "price_high" | "newest" | "discount"

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "discount", label: "Biggest Discount" },
]

const typeTabs: { key: ProductTypeTab; label: string; icon: typeof Layers }[] = [
  { key: "all", label: "All", icon: Layers },
  { key: "subscription", label: "Subscriptions", icon: Package },
  { key: "gift_card", label: "Gift Cards", icon: Gift },
  { key: "game", label: "Games", icon: Gamepad2 },
]

const trustBadges = [
  { icon: Zap, label: "Instant Delivery" },
  { icon: Shield, label: "100% Genuine" },
  { icon: Clock, label: "24/7 Support" },
  { icon: CheckCircle2, label: "Secure Payment" },
]

export default function StorePage() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get("category")
  const typeParam = searchParams.get("type") as ProductTypeTab | null

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [activeType, setActiveType] = useState<ProductTypeTab>(typeParam || "all")
  const [sortBy, setSortBy] = useState<SortOption>("default")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [gridSize, setGridSize] = useState<"small" | "large">("large")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.all([
          getProducts({ limit: 100 }),
          getCategories({ parentOnly: true }),
        ])
        setProducts(prods)
        setCategories(cats as Category[])
        if (categorySlug) {
          const found = (cats as Category[]).find(c => c.slug === categorySlug)
          if (found) setSelectedCategory(found.name)
        }
      } catch (e) {
        console.error("[v0] StorePage load error:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [categorySlug])

  const categoryNames = useMemo(
    () => ["All", ...categories.map(c => c.name)],
    [categories]
  )

  const typeCounts = useMemo(() => {
    const base = selectedCategory === "All" ? products : products.filter(p => p.category?.name === selectedCategory)
    const q = searchQuery.toLowerCase()
    const searched = q ? base.filter(p => p.name.toLowerCase().includes(q)) : base
    return {
      all: searched.length,
      subscription: searched.filter(p => p.product_type === "subscription").length,
      gift_card: searched.filter(p => p.product_type === "gift_card").length,
      game: searched.filter(p => p.product_type === "game").length,
    }
  }, [products, selectedCategory, searchQuery])

  const filteredProducts = useMemo(() => {
    let results = [...products]

    // Category filter
    if (selectedCategory !== "All") {
      results = results.filter(p => p.category?.name === selectedCategory)
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      results = results.filter(p => p.name.toLowerCase().includes(q))
    }

    // Type filter
    if (activeType !== "all") {
      results = results.filter(p => p.product_type === activeType)
    }

    // Sort
    switch (sortBy) {
      case "price_low": results.sort((a, b) => a.base_price - b.base_price); break
      case "price_high": results.sort((a, b) => b.base_price - a.base_price); break
      case "newest": results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break
      case "discount": results.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0)); break
      default: results.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)); break
    }

    return results
  }, [products, selectedCategory, activeType, sortBy, searchQuery])

  const handleCategorySelect = useCallback((cat: string) => {
    setSelectedCategory(cat)
    setActiveType("all")
    setSearchQuery("")
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb items={[
        { label: "Store" },
        ...(selectedCategory !== "All" ? [{ label: selectedCategory }] : []),
      ]} />

      {/* Store Hero Banner */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="max-w-xl">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-primary">Nepal{"'"}s Digital Store</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight text-balance">
                  All <span className="text-primary">Products</span>
                </h1>
                <p className="text-[13px] sm:text-[14px] text-muted-foreground mt-2 leading-relaxed text-pretty">
                  Buy Netflix, Spotify, YouTube Premium subscriptions, game top-ups, and digital products in Nepal. 
                  Pay with eSewa, Khalti, and ConnectIPS. Instant delivery guaranteed.
                </p>
              </motion.div>
            </div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
              className="flex items-center gap-3 sm:gap-4 flex-wrap"
            >
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5">
                  <badge.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium whitespace-nowrap">{badge.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <main className="pt-4 sm:pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.3 }}
            className="mb-4 sm:mb-5"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 sm:h-11 pl-9 pr-4 bg-card border border-border rounded-xl text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                  <span className="text-xs font-medium">Clear</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}
            className="mb-4 sm:mb-5 -mx-3 px-3 sm:mx-0 sm:px-0"
          >
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {categoryNames.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Type Tabs + Sort + Grid Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.3 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6"
          >
            {/* Type tabs */}
            <div className="-mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
                {typeTabs.map((tab) => {
                  const isActive = activeType === tab.key
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveType(tab.key)}
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-secondary text-foreground border border-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none ${
                        isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                      }`}>
                        {typeCounts[tab.key]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sort + Grid */}
            <div className="flex items-center gap-2 justify-between sm:justify-end">
              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-[11px] sm:text-[12px] font-medium text-foreground hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowSortDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-xl z-40 min-w-[180px] py-1"
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setShowSortDropdown(false) }}
                          className={`w-full text-left px-3.5 py-2.5 text-[12px] cursor-pointer transition-colors ${
                            sortBy === opt.value
                              ? "text-primary font-semibold bg-primary/5"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>

              {/* Grid toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setGridSize("large")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${gridSize === "large" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/30"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridSize("small")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${gridSize === "small" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/30"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Result count */}
          <div className="mb-4">
            <p className="text-[11px] sm:text-[12px] text-muted-foreground">
              Showing <span className="font-semibold text-primary">{filteredProducts.length}</span> products
              {selectedCategory !== "All" && (
                <span> in <span className="font-semibold text-foreground">{selectedCategory}</span></span>
              )}
              {activeType !== "all" && (
                <span> {" / "} <span className="font-semibold text-foreground capitalize">{activeType.replace("_", " ")}s</span></span>
              )}
              {searchQuery && (
                <span> matching <span className="font-semibold text-foreground">{'"'}{searchQuery}{'"'}</span></span>
              )}
            </p>
          </div>

          {/* Product Grid */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : filteredProducts.length > 0 ? (
            <div className={`grid gap-2.5 sm:gap-3 lg:gap-4 ${
              gridSize === "large"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            }`}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.025, 0.5), duration: 0.25 }}
                >
                  <ProductCard
                    id={product.slug || product.id}
                    name={product.name}
                    image={product.image_url || "/placeholder.svg"}
                    price={product.base_price}
                    originalPrice={product.original_price > 0 && product.original_price > product.base_price ? product.original_price : undefined}
                    discount={product.original_price > 0 && product.original_price > product.base_price ? `-${Math.round(((product.original_price - product.base_price) / product.original_price) * 100)}%` : undefined}
                    category={product.category?.name}
                    productType={product.product_type}
                    instantDelivery
                    bestSeller={product.is_featured}
                    outOfStock={product.stock_quantity === 0}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-[15px] font-semibold text-foreground">No products found</p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-xs">
                Try selecting a different category, adjusting filters, or searching with different keywords.
              </p>
              <button
                onClick={() => { setSelectedCategory("All"); setActiveType("all"); setSearchQuery(""); setSortBy("default") }}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* SEO Content Block */}
          {!loading && (
            <motion.section
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-border/40"
            >
              <div className="max-w-3xl">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                  Buy Digital Subscriptions {"&"} Products in <span className="text-primary">Nepal</span>
                </h2>
                <div className="space-y-3 text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed">
                  <p>
                    Premium Subscriptions Store is Nepal{"'"}s most trusted platform for digital subscriptions, streaming services, 
                    and game top-ups. We offer the best prices in NPR for Netflix, Spotify Premium, YouTube Premium, 
                    Canva Pro, Adobe Creative Cloud, Discord Nitro, and many more popular services.
                  </p>
                  <p>
                    All our products come with instant delivery. Purchase using Nepal{"'"}s popular payment 
                    methods including eSewa, Khalti, ConnectIPS, and Internet Banking. Our 24/7 customer 
                    support team is always ready to help you with any questions.
                  </p>
                  <p>
                    Whether you{"'"}re looking for streaming subscriptions, gaming credits, or software 
                    licenses, Premium Subscriptions Store has everything you need at competitive prices. Join over 50,000+ 
                    satisfied customers across Nepal who trust us for their digital purchases.
                  </p>
                </div>

                {/* SEO keyword links */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    "Netflix Nepal", "Spotify Nepal", "YouTube Premium Nepal",
                    "Game Top-Up Nepal", "Digital Subscription Nepal", "eSewa Payment",
                    "Khalti Payment", "Streaming Nepal", "Gift Cards Nepal",
                  ].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-secondary/60 text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { value: "50,000+", label: "Happy Customers" },
                  { value: `${products.length}+`, label: "Products Available" },
                  { value: "24/7", label: "Customer Support" },
                  { value: "Instant", label: "Delivery Time" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 sm:p-4 rounded-xl bg-card border border-border/40">
                    <div className="text-lg sm:text-xl font-bold text-primary">{stat.value}</div>
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
