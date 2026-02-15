"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getCategories, type Category } from "@/lib/data"
import Link from "next/link"
import Image from "next/image"
import { FolderOpen, ChevronRight } from "lucide-react"
import { CategoriesGridSkeleton } from "@/components/skeletons"

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories({ parentOnly: true })
        setCategories(cats as Category[])
      } catch (e) {
        console.error("[v0] CategoriesSection load error:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-5 sm:mb-8 space-y-2">
            <div className="h-5 w-44 rounded bg-secondary/60 animate-pulse" />
            <div className="h-3 w-64 rounded bg-secondary/40 animate-pulse" />
          </div>
          <CategoriesGridSkeleton count={8} />
        </div>
      </section>
    )
  }

  if (categories.length === 0) return null

  return (
    <section className="py-8 sm:py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Browse by <span className="text-primary">Category</span></h2>
          <p className="text-sm text-muted-foreground mt-1">Find the perfect gift card from our curated categories.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer"
              >
                {cat.image_url ? (
                  <div className="relative h-28 sm:h-32 overflow-hidden bg-secondary">
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  </div>
                ) : (
                  <div className="h-28 sm:h-32 flex items-center justify-center bg-secondary/50">
                    <FolderOpen className="w-10 h-10 text-primary/40" />
                  </div>
                )}
                <div className="p-3 sm:p-4">
                  <h3 className="text-[13px] sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
                  )}
                  <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] text-primary font-medium mt-2 group-hover:gap-1.5 transition-all">
                    Browse <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
