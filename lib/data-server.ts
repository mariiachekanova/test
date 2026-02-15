import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/data"

function mapProduct(row: Record<string, unknown>): Product {
  const cat = row.categories as Record<string, unknown> | null
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    short_description: (row.short_description as string) || null,
    long_description: (row.long_description as string) || null,
    product_type: row.product_type as "gift_card" | "game" | "subscription",
    category_id: (row.category_id as string) || null,
    base_price: Number(row.base_price) || 0,
    original_price: row.original_price ? Number(row.original_price) : null,
    currency: (row.currency as string) || "NPR",
    image_url: (row.image_url as string) || null,
    sku: (row.sku as string) || null,
    stock_quantity: Number(row.stock_quantity) ?? 0,
    is_active: row.is_active as boolean,
    is_featured: row.is_featured as boolean,
    display_order: Number(row.display_order) || 0,
    rating: Number(row.rating) || 0,
    total_reviews: Number(row.total_reviews) || 0,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    category: cat ? { id: cat.id as string, name: cat.name as string, slug: cat.slug as string } : null,
    tags: [],
    faqs: [],
    denominations: [],
    plans: [],
    game_meta: null,
  }
}

export const getProductBySlugServer = cache(async function getProductBySlugServer(slug: string): Promise<Product | null> {
  const supabase = await createClient()

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
})

export async function getReviewsServer(productId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reviews")
    .select("*, profile:profiles(full_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(10)
  return data || []
}

export async function getReviewStatsServer(productId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
  if (!data || data.length === 0) return { avg: 0, count: 0 }
  const sum = data.reduce((a: number, r: { rating: number }) => a + r.rating, 0)
  return { avg: Math.round((sum / data.length) * 10) / 10, count: data.length }
}

// ─── Categories (server) ────────────────────────────────────────────

export const getCategoryBySlugServer = cache(async function getCategoryBySlugServer(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()
  return data as {
    id: string; name: string; slug: string; description: string | null;
    parent_id: string | null; image_url: string | null; display_order: number;
    is_active: boolean; created_at: string; updated_at: string;
  } | null
})

export const getCategoryByIdServer = cache(async function getCategoryByIdServer(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()
  return data as {
    id: string; name: string; slug: string; description: string | null;
    parent_id: string | null; image_url: string | null;
  } | null
})

export async function getChildCategoriesServer(parentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", parentId)
    .eq("is_active", true)
    .order("display_order")
  return (data || []) as Array<{
    id: string; name: string; slug: string; description: string | null;
    image_url: string | null; parent_id: string | null;
  }>
}

export async function getProductsByCategoryServer(categoryId: string, childCategoryIds: string[] = []) {
  const supabase = await createClient()
  const allIds = [categoryId, ...childCategoryIds]
  const { data } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .in("category_id", allIds)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
  return (data || []).map(mapProduct)
}

export async function getAllCategoriesServer() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
  return (data || []) as Array<{
    id: string; name: string; slug: string; description: string | null;
    parent_id: string | null; image_url: string | null; updated_at: string;
  }>
}

export async function getRelatedProductsServer(productId: string, categoryId: string | null, limit = 4) {
  const supabase = await createClient()

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

// ─── Blog (server) ──────────────────────────────────────────────────

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  image_url: string | null
  status: string          // "published" | "draft"
  category_tag: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  views: number
  created_at: string
  updated_at: string
  linked_products?: Product[]
}

export async function getBlogPostsServer(limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data || []) as BlogPost[]
}

export const getBlogPostBySlugServer = cache(async function getBlogPostBySlugServer(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !data) return null

  // Fetch linked products
  const { data: links } = await supabase
    .from("blog_post_products")
    .select("product_id")
    .eq("blog_post_id", data.id)

  let linkedProducts: Product[] = []
  if (links && links.length > 0) {
    const productIds = links.map((l: { product_id: string }) => l.product_id)
    const { data: products } = await supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .in("id", productIds)
      .eq("is_active", true)
    linkedProducts = (products || []).map(mapProduct)
  }

  return { ...data, linked_products: linkedProducts } as BlogPost
})

export async function getAllBlogPostsServer() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
  return (data || []) as BlogPost[]
}
