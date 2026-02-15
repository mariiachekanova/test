import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client'

const BASE = 'https://www.royalsewa.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  const [{ data: products }, { data: categories }, { data: blogPosts }] = await Promise.all([
    supabase.from('products').select('slug, id, updated_at').eq('is_active', true),
    supabase.from('categories').select('id, slug, parent_id, updated_at').eq('is_active', true).order('display_order'),
    supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
  ])

  // Build parent slug lookup
  const catById = new Map((categories || []).map((c) => [c.id, c]))
  const parents = (categories || []).filter((c) => !c.parent_id)
  const children = (categories || []).filter((c) => c.parent_id)

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/store`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/refund`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Product pages
  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE}/product/${p.slug || p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Parent category pages: /category/{slug}
  const parentPages: MetadataRoute.Sitemap = parents.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  // Child category pages: /category/{parent-slug}/{child-slug}
  const childPages: MetadataRoute.Sitemap = children
    .map((child) => {
      const parent = catById.get(child.parent_id!)
      if (!parent) return null
      return {
        url: `${BASE}/category/${parent.slug}/${child.slug}`,
        lastModified: new Date(child.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })
    .filter(Boolean) as MetadataRoute.Sitemap

  // Blog pages
  const blogListPage: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
  ]
  const blogPages: MetadataRoute.Sitemap = (blogPosts || []).map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...parentPages, ...childPages, ...blogListPage, ...blogPages]
}
