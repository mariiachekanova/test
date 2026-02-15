import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { getBlogPostBySlugServer, getBlogPostsServer, type BlogPost } from "@/lib/data-server"
import { Clock, ArrowLeft } from "lucide-react"

// ─── Dynamic SEO Metadata ───────────────────────────────────────────
type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlugServer(slug)
  if (!post) return { title: "Post Not Found - RoyalSewa" }

  const title = post.meta_title || `${post.title} - RoyalSewa Blog`
  const description = post.meta_description || post.excerpt || `Read ${post.title} on RoyalSewa Blog.`
  const url = `https://www.royalsewa.com/blog/${post.slug}`

  return {
    title,
    description,
    keywords: post.meta_keywords ? post.meta_keywords.join(", ") : `${post.title}, RoyalSewa, blog, Nepal, digital products`,
    openGraph: {
      title,
      description,
      url,
      siteName: "RoyalSewa",
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      ...(post.image_url ? { images: [{ url: post.image_url, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
  }
}

// ─── Blog Content Skeleton ──────────────────────────────────────────
function BlogSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 animate-pulse">
      <div className="h-3 w-48 bg-secondary rounded mb-6" />
      <div className="h-8 w-4/5 bg-secondary rounded mb-3" />
      <div className="flex gap-4 mb-6">
        <div className="h-3 w-20 bg-secondary rounded" />
        <div className="h-3 w-24 bg-secondary rounded" />
      </div>
      <div className="aspect-[2/1] rounded-xl bg-secondary mb-6" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => <div key={i} className="h-3 bg-secondary rounded" style={{ width: `${85 - i * 5}%` }} />)}
      </div>
    </div>
  )
}

// ─── Blog Article (server-rendered) ─────────────────────────────────
async function BlogArticle({ slug }: { slug: string }) {
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlugServer(slug),
    getBlogPostsServer(10),
  ])

  if (!post) notFound()

  const dateStr = new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const wordCount = (post.content || "").replace(/<[^>]*>/g, "").split(/\s+/).length
  const readTime = Math.max(1, Math.round(wordCount / 200))
  const plainText = (post.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

  // Related posts (exclude current)
  const related = allPosts.filter(p => p.id !== post.id).slice(0, 3)

  const url = `https://www.royalsewa.com/blog/${post.slug}`

  // JSON-LD schemas
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || plainText.slice(0, 160),
    url,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    ...(post.image_url ? { image: post.image_url } : {}),
    author: { "@type": "Organization", name: "RoyalSewa" },
    publisher: {
      "@type": "Organization",
      name: "RoyalSewa",
      url: "https://www.royalsewa.com",
      logo: { "@type": "ImageObject", url: "https://www.royalsewa.com/android-chrome-512x512.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    wordCount,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.royalsewa.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.royalsewa.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  }

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]} />

        {/* Article Header */}
        <header className="mb-6 mt-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight text-balance">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[12px] text-muted-foreground">
            {post.category_tag && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-semibold uppercase">
                {post.category_tag}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {dateStr}
            </span>
            <span>{readTime} min read</span>
            {post.views > 0 && <span>{post.views.toLocaleString()} views</span>}
          </div>
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="relative aspect-[2/1] rounded-xl overflow-hidden mb-8 ring-1 ring-border">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        )}

        {/* Article Body -- HTML content rendered server-side */}
        <article
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />

        {/* Linked Products */}
        {post.linked_products && post.linked_products.length > 0 && (
          <section className="mt-10 pt-6 border-t border-border">
            <h2 className="text-[15px] font-bold text-foreground mb-3">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {post.linked_products.map(product => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug || product.id}`}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square bg-secondary">
                    {product.image_url && (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-200" sizes="160px" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{product.name}</p>
                    {product.base_price > 0 && (
                      <p className="text-[11px] text-primary font-bold mt-0.5">NPR {product.base_price.toLocaleString()}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="mt-10 pt-6 border-t border-border">
            <h2 className="text-[15px] font-bold text-foreground mb-3">More from the Blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map(rp => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all">
                  <div className="relative aspect-[16/9] bg-secondary">
                    {rp.image_url && (
                      <Image src={rp.image_url} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-200" sizes="240px" />
                    )}
                  </div>
                  <div className="p-3 flex-1">
                    <p className="text-[12px] font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{rp.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(rp.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <div className="mt-8 flex items-center justify-between">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:gap-2.5 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* SEO: Plain text for crawlers */}
      <article className="sr-only" aria-label={`Full text of: ${post.title}`}>
        <h1>{post.title}</h1>
        {post.excerpt && <p>{post.excerpt}</p>}
        <p>{plainText}</p>
        {post.linked_products && post.linked_products.length > 0 && (
          <section>
            <h2>Related Products</h2>
            <ul>
              {post.linked_products.map(p => (
                <li key={p.id}>
                  <a href={`https://www.royalsewa.com/product/${p.slug || p.id}`}>{p.name}</a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  )
}

// ─── Not Found ──────────────────────────────────────────────────────
function BlogNotFoundFallback() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-lg font-bold text-foreground mb-1">Post Not Found</h1>
      <p className="text-[12px] text-muted-foreground mb-4">This blog post does not exist or has been removed.</p>
      <Link href="/blog" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-semibold hover:bg-primary/90 transition-colors">
        Browse Blog
      </Link>
    </div>
  )
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Suspense fallback={<BlogSkeleton />}>
          <BlogArticle slug={slug} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
