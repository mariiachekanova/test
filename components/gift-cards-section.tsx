"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ProductCard } from "./product-card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ProductGridSkeleton } from "@/components/skeletons"
import type { Product } from "@/lib/data"

// ── Helper to map raw Supabase row to Product shape ─────────────────
function mapRow(r: Record<string, unknown>): Product {
  const cat = r.categories as { id: string; name: string; slug: string } | null
  return {
    id: r.id as string,
    name: r.name as string,
    slug: (r.slug as string) || (r.id as string),
    short_description: (r.short_description as string) || null,
    long_description: (r.long_description as string) || null,
    product_type: (r.product_type as string) || "subscription",
    image_url: (r.image_url as string) || null,
    gallery_images: (r.gallery_images as string[]) || [],
    base_price: (r.base_price as number) || 0,
    original_price: (r.original_price as number) || 0,
    discount_percentage: (r.discount_percentage as number) || 0,
    stock_quantity: (r.stock_quantity as number) || 999,
    is_featured: (r.is_featured as boolean) || false,
    is_active: true,
    category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
    category_id: (r.category_id as string) || null,
    sku: (r.sku as string) || null,
    meta_title: null,
    meta_description: null,
    meta_keywords: [],
    plans: [],
    faqs: [],
    created_at: (r.created_at as string) || "",
    updated_at: (r.updated_at as string) || "",
  }
}

// ── Reusable section for a product type ─────────────────────────────
function ProductTypeSection({
  title,
  highlight,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel,
  cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  delay = 0,
}: {
  title: string
  highlight: string
  subtitle: string
  products: Product[]
  viewAllHref: string
  viewAllLabel: string
  cols?: string
  delay?: number
}) {
  if (products.length === 0) return null

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-foreground text-balance">
          {title} <span className="text-primary">{highlight}</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className={`grid ${cols} gap-3 sm:gap-4`}>
        {products.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: delay + idx * 0.04 }}
          >
            <ProductCard
              id={p.slug || p.id}
              name={p.name}
              image={p.image_url || "/placeholder.svg"}
              price={p.base_price}
              originalPrice={
                p.original_price > 0 && p.original_price > p.base_price
                  ? p.original_price
                  : undefined
              }
              discount={
                p.original_price > 0 && p.original_price > p.base_price
                  ? `-${Math.round(((p.original_price - p.base_price) / p.original_price) * 100)}%`
                  : undefined
              }
              category={p.category?.name}
              productType={p.product_type}
              instantDelivery
              bestSeller={p.is_featured}
            />
          </motion.div>
        ))}
      </div>
      <Link
        href={viewAllHref}
        className="text-primary text-sm font-medium mt-4 inline-flex items-center gap-1 hover:underline cursor-pointer"
      >
        {viewAllLabel} <span className="text-lg">{"→"}</span>
      </Link>
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────
export function GiftCardsSection() {
  const [subscriptions, setSubscriptions] = useState<Product[]>([])
  const [giftCards, setGiftCards] = useState<Product[]>([])
  const [games, setGames] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("products")
          .select("*, categories(id, name, slug)")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) {
          console.error("[v0] GiftCardsSection load error:", error)
          return
        }

        const all = (data || []).map(mapRow)

        setSubscriptions(
          all.filter((p) => p.product_type === "subscription").slice(0, 5)
        )
        setGiftCards(
          all.filter((p) => p.product_type === "gift_card").slice(0, 5)
        )
        setGames(
          all.filter((p) => p.product_type === "game").slice(0, 5)
        )
      } catch (e) {
        console.error("[v0] GiftCardsSection load error:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="mb-4 sm:mb-6 space-y-2">
                <div className="h-5 w-52 rounded bg-secondary/60 animate-pulse" />
                <div className="h-3 w-72 rounded bg-secondary/40 animate-pulse" />
              </div>
              <ProductGridSkeleton
                count={5}
                cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
              />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (
    subscriptions.length === 0 &&
    giftCards.length === 0 &&
    games.length === 0
  ) {
    return null
  }

  return (
    <section className="py-8 sm:py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* 1. Subscriptions */}
        <ProductTypeSection
          title="Subscriptions &"
          highlight="Streaming"
          subtitle="Get Netflix, Spotify, YouTube Premium, and other subscription services at the best prices in Nepal."
          products={subscriptions}
          viewAllHref="/store?type=subscription"
          viewAllLabel="View all subscriptions"
          delay={0}
        />

        {/* 2. Gift Cards */}
        <ProductTypeSection
          title="Gift Cards &"
          highlight="Vouchers"
          subtitle="Buy Google Play, iTunes, Amazon, and more gift cards with instant delivery in Nepal."
          products={giftCards}
          viewAllHref="/store?type=gift_card"
          viewAllLabel="Browse all gift cards"
          delay={0.05}
        />

        {/* 3. Games */}
        <ProductTypeSection
          title="Games &"
          highlight="Top-Ups"
          subtitle="Purchase game top-ups, Steam Wallet codes, PlayStation Store, and Xbox credits for Nepal gamers."
          products={games}
          viewAllHref="/store?type=game"
          viewAllLabel="Explore all games"
          delay={0.1}
        />
      </div>
    </section>
  )
}
