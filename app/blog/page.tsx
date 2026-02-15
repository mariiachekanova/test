import { Metadata } from "next"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getBlogPostsServer, type BlogPost } from "@/lib/data-server"
import { Clock, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog - Premium Subscriptions Store | Digital Guides, Deals & News from Nepal",
  description: "Read the latest guides, deals, and news about digital subscriptions, gift cards, games, and software in Nepal. Tips and tricks from Premium Subscriptions Store.",
  openGraph: {
    title: "Blog - Premium Subscriptions Store",
    description: "Digital guides, deals & news from Nepal's trusted digital store.",
    url: "https://www.premiumsubscriptions.store/blog",
    siteName: "Premium Subscriptions Store",
    type: "website",
  },
  alternates: { canonical: "https://www.premiumsubscriptions.store/blog" },
}

function BlogCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-secondary" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3 w-24 bg-secondary rounded" />
        <div className="h-5 w-4/5 bg-secondary rounded" />
        <div className="h-3 w-full bg-secondary rounded" />
        <div className="h-3 w-3/4 bg-secondary rounded" />
        <div className="flex gap-3 pt-1">
          <div className="h-3 w-16 bg-secondary rounded" />
          <div className="h-3 w-20 bg-secondary rounded" />
        </div>
      </div>
    </div>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  const dateStr = new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  const wordCount = (post.content || "").replace(/<[^>]*>/g, "").split(/\s+/).length
  const readTime = Math.max(1, Math.round(wordCount / 200))

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
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
              <span className="text-3xl text-muted-foreground/20 font-bold">RS</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {post.category_tag && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-semibold uppercase">
                {post.category_tag}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {dateStr}
            </span>
            <span>{readTime} min read</span>
          </div>

          <h2 className="text-[15px] font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:gap-2 transition-all">
              Read More
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

async function BlogGrid() {
  const posts = await getBlogPostsServer(30)

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[15px] font-semibold text-foreground mb-1">No blog posts yet</p>
        <p className="text-[12px] text-muted-foreground">Check back soon for guides, deals, and news.</p>
      </div>
    )
  }

  return (
    <>
      {/* Featured post (first one) */}
      {posts.length > 0 && (
        <Link href={`/blog/${posts[0].slug}`} className="group block mb-6">
          <article className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px] overflow-hidden bg-secondary">
                {posts[0].image_url ? (
                  <Image
                    src={posts[0].image_url}
                    alt={posts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl text-muted-foreground/20 font-bold">RS</span>
                  </div>
                )}
              </div>
              <div className="p-5 sm:p-7 flex flex-col justify-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Latest Post</span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight text-balance group-hover:text-primary transition-colors">
                  {posts[0].title}
                </h2>
                {posts[0].excerpt && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                    {posts[0].excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {posts[0].category_tag && (
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-semibold uppercase">{posts[0].category_tag}</span>
                  )}
                  <span>{new Date(posts[0].created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary group-hover:gap-2.5 transition-all">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Rest of posts */}
      {posts.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.slice(1).map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* SEO: server-rendered list for crawlers */}
      <nav className="sr-only" aria-label="Blog posts list">
        <ul>
          {posts.map(post => (
            <li key={post.id}>
              <a href={`https://www.premiumsubscriptions.store/blog/${post.slug}`}>{post.title}</a>
              {post.excerpt && <p>{post.excerpt}</p>}
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">Blog</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Guides, deals, and news about digital products in Nepal.
          </p>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        }>
          <BlogGrid />
        </Suspense>
      </main>
      <Footer />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Premium Subscriptions Store Blog",
        url: "https://www.premiumsubscriptions.store/blog",
        description: "Guides, deals, and news about digital products in Nepal.",
        publisher: { "@type": "Organization", name: "Premium Subscriptions Store", url: "https://www.premiumsubscriptions.store" },
      })}} />
    </div>
  )
}
