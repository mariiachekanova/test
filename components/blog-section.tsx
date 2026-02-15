"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Clock, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  image_url: string | null
  category_tag: string | null
  created_at: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function BlogCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-secondary" />
      <div className="p-3.5 flex flex-col gap-2">
        <div className="h-2.5 w-20 bg-secondary rounded" />
        <div className="h-4 w-4/5 bg-secondary rounded" />
        <div className="h-2.5 w-full bg-secondary rounded" />
        <div className="h-2.5 w-2/3 bg-secondary rounded" />
      </div>
    </div>
  )
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, image_url, category_tag, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3)
      setPosts((data || []) as BlogPost[])
      setLoading(false)
    }
    load()
  }, [])

  // Don't render section if no posts and not loading
  if (!loading && posts.length === 0) return null

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="py-8 sm:py-12"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div variants={fadeUp} custom={0} className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">From Our Blog</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Guides, deals, and news about digital products in Nepal.</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:gap-2 transition-all shrink-0"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, i) => {
              const dateStr = new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })

              return (
                <motion.div key={post.id} variants={fadeUp} custom={i + 1}>
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <article className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                        {post.image_url ? (
                          <Image
                            src={post.image_url}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-muted-foreground/20" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
                          {post.category_tag && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-semibold uppercase">
                              {post.category_tag}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {dateStr}
                          </span>
                        </div>

                        <h3 className="text-[13px] font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="mt-auto pt-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary group-hover:gap-1.5 transition-all">
                            Read More <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="sm:hidden mt-4 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary"
          >
            View All Posts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
