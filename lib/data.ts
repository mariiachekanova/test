"use client"

import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface Product {
  id: string
  name: string
  slug: string
  short_description: string | null
  long_description: string | null
  product_type: "gift_card" | "game" | "subscription"
  category_id: string | null
  base_price: number
  original_price: number
  discount_percentage: number
  image_url: string | null
  gallery_images: string[] | null
  is_active: boolean
  is_featured: boolean
  stock_quantity: number
  sku: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  created_at: string
  updated_at: string
  // Joined
  category?: Category | null
  tags?: Tag[]
  faqs?: FAQ[]
  denominations?: Denomination[]
  plans?: SubscriptionPlan[]
  game_meta?: GameMetadata | null
  _related?: Product[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  children?: Category[]
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface FAQ {
  id: string
  product_id: string
  question: string
  answer: string
  display_order: number
}

export interface Denomination {
  id: string
  product_id: string
  amount: number
  original_price: number
  is_active: boolean
}

export interface SubscriptionPlan {
  id: string
  product_id: string
  plan_name: string
  description: string | null
  is_active: boolean
  durations?: PlanDuration[]
}

export interface PlanDuration {
  id: string
  plan_id: string
  duration_name: string
  duration_value: number
  price: number
  original_price: number
  discount_percentage: number
  is_active: boolean
}

export interface GameMetadata {
  id: string
  product_id: string
  platform: string[]
  genre: string[]
  developer: string | null
  publisher: string | null
  release_date: string | null
  system_requirements: Record<string, unknown> | null
}

// ─── Products ────────────────────────────────────────────────────────

export async function getProducts(opts?: {
  limit?: number
  offset?: number
  featured?: boolean
  type?: string
  categoryId?: string
  search?: string
  active?: boolean
}) {
  let q = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .order("created_at", { ascending: false })

  if (opts?.active !== false) q = q.eq("is_active", true)
  if (opts?.featured) q = q.eq("is_featured", true)
  if (opts?.type) q = q.eq("product_type", opts.type)
  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId)
  if (opts?.search) q = q.or(`name.ilike.%${opts.search}%,short_description.ilike.%${opts.search}%`)
  if (opts?.limit) q = q.limit(opts.limit)
  if (opts?.offset) q = q.range(opts.offset, opts.offset + (opts.limit || 20) - 1)

  const { data, error } = await q
  if (error) { console.error("[v0] getProducts error:", error); return [] }
  return (data || []).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Try by slug first, then by id
  let { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .single()

  if (error || !data) {
    const res = await supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .eq("id", slug)
      .single()
    data = res.data
    error = res.error
  }

  if (error || !data) return null
  const product = mapProduct(data)

  // Fetch related data in parallel
  const [tags, faqs, denominations, plans, gameMeta] = await Promise.all([
    supabase.from("product_tags").select("tags(id, name, slug)").eq("product_id", product.id),
    supabase.from("product_faqs").select("*").eq("product_id", product.id).order("display_order"),
    product.product_type === "gift_card"
      ? supabase.from("gift_card_denominations").select("*").eq("product_id", product.id).eq("is_active", true)
      : Promise.resolve({ data: null }),
    product.product_type === "subscription"
      ? supabase.from("subscription_plans").select("*, subscription_durations(*)").eq("product_id", product.id).eq("is_active", true)
      : Promise.resolve({ data: null }),
    product.product_type === "game"
      ? supabase.from("game_details").select("*").eq("product_id", product.id).single()
      : Promise.resolve({ data: null }),
  ])

  product.tags = (tags.data || []).map((t: any) => t.tags).filter(Boolean)
  product.faqs = faqs.data || []
  product.denominations = denominations.data || []
  product.plans = (plans.data || []).map((p: any) => ({
    ...p,
    durations: p.subscription_durations || [],
    subscription_durations: undefined,
  }))
  product.game_meta = gameMeta.data || null

  return product
}

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4) {
  let q = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("is_active", true)
    .neq("id", productId)
    .limit(limit)

  if (categoryId) q = q.eq("category_id", categoryId)

  const { data } = await q
  return (data || []).map(mapProduct)
}

// ─── Categories ──────────────────────────────────────────────────────

export async function getCategories(opts?: { parentOnly?: boolean; withChildren?: boolean }) {
  let q = supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (opts?.parentOnly) q = q.is("parent_id", null)

  const { data, error } = await q
  if (error) { console.error("[v0] getCategories error:", error); return [] }

  if (opts?.withChildren) {
    const parents = (data || []).filter((c: any) => !c.parent_id)
    const children = (data || []).filter((c: any) => c.parent_id)
    return parents.map((p: any) => ({
      ...p,
      children: children.filter((c: any) => c.parent_id === p.id),
    }))
  }

  return data || []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()
  return data
}

// ─── Reviews ─────────────────────────────────────────────────────────

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string | null
  body: string | null
  created_at: string
  updated_at: string
  profile?: { full_name: string | null; avatar_url: string | null } | null
}

export async function getReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(full_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (error) { console.error("[v0] getReviews error:", error); return [] }
  return (data || []).map((r: any) => ({
    ...r,
    profile: r.profiles || null,
    profiles: undefined,
  }))
}

export async function getReviewStats(productId: string): Promise<{ avg: number; count: number }> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)

  if (error || !data || data.length === 0) return { avg: 0, count: 0 }
  const sum = data.reduce((a: number, r: any) => a + r.rating, 0)
  return { avg: Math.round((sum / data.length) * 10) / 10, count: data.length }
}

export async function submitReview(productId: string, userId: string, rating: number, title: string, body: string) {
  const { data, error } = await supabase
    .from("reviews")
    .insert({ product_id: productId, user_id: userId, rating, title, body })
    .select("*, profiles(full_name, avatar_url)")
    .single()

  if (error) throw error
  return data ? { ...data, profile: data.profiles || null } : null
}

export async function deleteReview(reviewId: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId)
  if (error) throw error
}

// ─── Helpers ─────────────────────────────────────────────────────────

function mapProduct(row: any): Product {
  return {
    ...row,
    category: row.categories || null,
    categories: undefined,
  }
}
