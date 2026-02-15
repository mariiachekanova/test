import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import {
  getProductBySlugServer,
  getRelatedProductsServer,
  getReviewsServer,
  getReviewStatsServer,
} from "@/lib/data-server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import ProductDetailPage from "@/components/product-detail-page"

// ─── Dynamic SEO Metadata ───────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProductBySlugServer(id)
  if (!product) {
    return { title: "Product Not Found | Premium Subscriptions Store Nepal" }
  }

  const title = `${product.name} - Buy in Nepal | Premium Subscriptions Store`
  const description =
    product.short_description ||
    product.long_description?.replace(/<[^>]*>/g, "").slice(0, 155) ||
    `Buy ${product.name} in Nepal at the best price. Instant delivery, pay with eSewa, Khalti, ConnectIPS. Premium Subscriptions Store - Nepal's #1 digital store.`
  const imageUrl = product.image_url || "https://www.premiumsubscriptions.com/android-chrome-512x512.png"
  const url = `https://www.premiumsubscriptions.com/product/${product.slug || product.id}`
  const price = product.base_price
  const category = product.category?.name || "Digital Products"

  return {
    title,
    description,
    keywords: [
      `buy ${product.name.toLowerCase()} nepal`,
      `${product.name.toLowerCase()} price nepal`,
      `${product.name.toLowerCase()} nepal`,
      `${category.toLowerCase()} nepal`,
      "digital subscription nepal",
      "premium subscriptions store",
      "buy online nepal",
      "esewa payment",
      "khalti payment",
    ],
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Premium Subscriptions Store",
      images: [{ url: imageUrl, width: 600, height: 600, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: url },
    other: {
      "product:price:amount": String(price),
      "product:price:currency": "NPR",
    },
  }
}

// ─── Product Skeleton ───────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 animate-pulse">
        <div className="flex gap-2 mb-6">
          <div className="h-3 w-10 bg-secondary rounded" />
          <div className="h-3 w-3 bg-secondary rounded" />
          <div className="h-3 w-10 bg-secondary rounded" />
          <div className="h-3 w-3 bg-secondary rounded" />
          <div className="h-3 w-24 bg-secondary rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="aspect-square rounded-xl bg-secondary" />
          <div className="flex flex-col gap-3">
            <div className="h-5 w-3/4 bg-secondary rounded" />
            <div className="h-3 w-full bg-secondary rounded" />
            <div className="h-3 w-2/3 bg-secondary rounded" />
            <div className="h-6 w-32 bg-secondary rounded" />
            <div className="h-10 w-full bg-secondary rounded-lg" />
            <div className="h-10 w-full bg-secondary rounded-lg" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ─── Server-Rendered JSON-LD Schemas ────────────────────────────────
function ProductSchemaServer({
  product,
  reviewStats,
  reviews,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlugServer>>>
  reviewStats: { avg: number; count: number }
  reviews: Array<Record<string, unknown>>
}) {
  const url = `https://www.premiumsubscriptions.com/product/${product.slug || product.id}`
  const imageUrl = product.image_url || "https://www.premiumsubscriptions.com/android-chrome-512x512.png"
  const price = product.base_price

  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.short_description ||
      product.long_description?.replace(/<[^>]*>/g, "").slice(0, 300) ||
      `Buy ${product.name} in Nepal at the best price from Premium Subscriptions Store.`,
    image: imageUrl,
    url,
    sku: product.sku || product.id,
    brand: { "@type": "Brand", name: "Premium Subscriptions Store" },
    category: product.category?.name || "Digital Products",
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "NPR",
      price: price.toFixed(2),
      availability:
        product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Premium Subscriptions Store" },
      itemCondition: "https://schema.org/NewCondition",
    },
  }

  if (reviewStats.count > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewStats.avg.toFixed(1),
      reviewCount: reviewStats.count,
      bestRating: "5",
      worstRating: "1",
    }
  }

  if (reviews.length > 0) {
    productSchema.review = reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: (r.profile as Record<string, unknown> | null)?.full_name as string || "Customer",
      },
      datePublished: r.created_at,
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
      },
      ...(r.title ? { name: r.title } : {}),
      ...(r.body ? { reviewBody: r.body } : {}),
    }))
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.premiumsubscriptions.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Store",
        item: "https://www.premiumsubscriptions.com/store",
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `https://www.premiumsubscriptions.com/category/${product.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.name,
        item: url,
      },
    ],
  }

  const faqSchema =
    product.faqs && product.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: product.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}

// ─── Server-Rendered SEO Content (visible to crawlers, hidden visually) ──
function SeoContent({
  product,
  reviews,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlugServer>>>
  reviews: Array<Record<string, unknown>>
}) {
  const plainDescription = product.long_description
    ? product.long_description.replace(/<[^>]*>/g, "")
    : product.short_description || ""

  return (
    <article
      className="sr-only"
      aria-hidden="false"
      itemScope
      itemType="https://schema.org/Product"
    >
      <h1 itemProp="name">{product.name}</h1>
      <meta itemProp="image" content={product.image_url || ""} />
      <meta
        itemProp="url"
        content={`https://www.premiumsubscriptions.com/product/${product.slug || product.id}`}
      />

      {product.category && (
        <nav aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="https://www.premiumsubscriptions.com">Home</a>
            </li>
            <li>
              <a href="https://www.premiumsubscriptions.com/store">Store</a>
            </li>
            <li>
              <a
                href={`https://www.premiumsubscriptions.com/category/${product.category.slug}`}
              >
                {product.category.name}
              </a>
            </li>
            <li>{product.name}</li>
          </ol>
        </nav>
      )}

      {plainDescription && (
        <section>
          <h2>Description</h2>
          <div itemProp="description">{plainDescription}</div>
        </section>
      )}

      <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
        <meta itemProp="priceCurrency" content="NPR" />
        <meta itemProp="price" content={String(product.base_price)} />
        <meta
          itemProp="availability"
          content={
            product.stock_quantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock"
          }
        />
        <link
          itemProp="url"
          href={`https://www.premiumsubscriptions.com/product/${product.slug || product.id}`}
        />
      </div>

      {product.faqs && product.faqs.length > 0 && (
        <section>
          <h2>Frequently Asked Questions</h2>
          {product.faqs.map((faq) => (
            <div key={faq.id}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </section>
      )}

      {reviews.length > 0 && (
        <section>
          <h2>Customer Reviews</h2>
          {reviews.map((r) => (
            <div key={r.id as string}>
              <p>
                <strong>{(r.profile as Record<string, unknown> | null)?.full_name as string || "Customer"}</strong> rated{" "}
                {String(r.rating)}/5
              </p>
              {r.title && <p>{r.title as string}</p>}
              {r.body && <p>{r.body as string}</p>}
            </div>
          ))}
        </section>
      )}
    </article>
  )
}

// ─── Async Server Data Loader ───────────────────────────────────────
async function ProductLoader({ slug }: { slug: string }) {
  const product = await getProductBySlugServer(slug)
  if (!product) notFound()

  const [related, reviews, reviewStats] = await Promise.all([
    getRelatedProductsServer(product.id, product.category_id, 4).catch(
      () => []
    ),
    getReviewsServer(product.id).catch(() => []),
    getReviewStatsServer(product.id).catch(() => ({ avg: 0, count: 0 })),
  ])

  ;(product as any)._related = related

  return (
    <div className="min-h-screen bg-background">
      {/* Server-rendered schemas -- in HTML source for crawlers */}
      <ProductSchemaServer
        product={product}
        reviewStats={reviewStats}
        reviews={reviews}
      />
      {/* Server-rendered semantic HTML for crawlers (sr-only) */}
      <SeoContent product={product} reviews={reviews} />

      <Header />
      <main>
        <ProductDetailPage
          product={product}
          initialReviews={reviews}
          initialReviewStats={reviewStats}
        />
      </main>
      <Footer />
    </div>
  )
}

// ─── Page (Server Component) ────────────────────────────────────────
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductLoader slug={id} />
    </Suspense>
  )
}
