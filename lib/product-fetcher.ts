"use client"

import { getProductBySlug, getRelatedProducts, type Product } from "@/lib/data"

export const productFetcher = async (slug: string): Promise<Product> => {
  const p = await getProductBySlug(slug)
  if (!p) {
    const err = new Error("not-found") as Error & { status: number }
    err.status = 404
    throw err
  }
  try {
    const related = await getRelatedProducts(p.id, p.category_id, 4)
    ;(p as any)._related = related
  } catch {
    ;(p as any)._related = []
  }
  return p
}
