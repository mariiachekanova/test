import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  getCategoryBySlugServer,
  getProductsByCategoryServer,
} from "@/lib/data-server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ChevronRight, Package } from "lucide-react"

const BASE = "https://www.royalsewa.com"

// ─── Dynamic Metadata ───────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; child: string }>
}): Promise<Metadata> {
  const { slug, child: childSlug } = await params
  const [parent, category] = await Promise.all([
    getCategoryBySlugServer(slug),
    getCategoryBySlugServer(childSlug),
  ])
  if (!parent || !category) return { title: "Category Not Found | RoyalSewa" }

  const title = `${category.name} - ${parent.name} | Buy in Nepal | RoyalSewa`
  const description =
    category.description ||
    `Browse ${category.name} under ${parent.name} at the best prices in Nepal. Instant delivery, pay with eSewa, Khalti, ConnectIPS.`
  const url = `${BASE}/category/${parent.slug}/${category.slug}`

  return {
    title,
    description,
    keywords: [
      `${category.name.toLowerCase()} nepal`,
      `buy ${category.name.toLowerCase()} nepal`,
      `${parent.name.toLowerCase()} ${category.name.toLowerCase()} nepal`,
      "digital products nepal",
      "royalsewa",
    ],
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "RoyalSewa",
      ...(category.image_url ? { images: [{ url: category.image_url, width: 600, height: 400, alt: category.name }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
  }
}

// ─── Page ───────────────────────────────────────────────────────────
export default async function ChildCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; child: string }>
}) {
  const { slug, child: childSlug } = await params
  const [parent, category] = await Promise.all([
    getCategoryBySlugServer(slug),
    getCategoryBySlugServer(childSlug),
  ])
  if (!parent || !category) notFound()

  const products = await getProductsByCategoryServer(category.id)

  const url = `${BASE}/category/${parent.slug}/${category.slug}`
  const description =
    category.description ||
    `Browse ${category.name} under ${parent.name} at the best prices in Nepal. Instant delivery via eSewa, Khalti & more.`

  // ─── JSON-LD ────────────────────────────────────────────────────
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} - ${parent.name}`,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: "RoyalSewa", url: BASE },
    numberOfItems: products.length,
    ...(category.image_url ? { image: category.image_url } : {}),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Store", item: `${BASE}/store` },
      { "@type": "ListItem", position: 3, name: parent.name, item: `${BASE}/category/${parent.slug}` },
      { "@type": "ListItem", position: 4, name: category.name, item: url },
    ],
  }

  const itemListSchema = products.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} Products`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${BASE}/product/${p.slug || p.id}`,
    })),
  } : null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* ─── JSON-LD (server-rendered) ─── */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        {itemListSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        )}

        {/* ─── Breadcrumb ─── */}
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
          <ol className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-muted-foreground flex-wrap">
            <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link href="/store" className="hover:text-foreground transition-colors">Store</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link href={`/category/${parent.slug}`} className="hover:text-foreground transition-colors">{parent.name}</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium truncate">{category.name}</li>
          </ol>
        </nav>

        {/* ─── Hero Banner ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-secondary/30 border border-border/60 p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
              {category.image_url && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-border/40 shadow-lg shrink-0">
                  <Image src={category.image_url} alt={category.name} width={80} height={80} className="object-cover w-full h-full" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                  <Link href={`/category/${parent.slug}`} className="hover:text-primary transition-colors">{parent.name}</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground font-medium">{category.name}</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground text-balance leading-tight mb-1.5">
                  {category.name}
                </h1>
                <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed max-w-2xl">
                  {description}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {products.length} product{products.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Product Grid ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] sm:text-base font-semibold text-foreground">
              {category.name} Products
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {products.length} result{products.length !== 1 ? "s" : ""}
            </span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.slug || product.id}
                  name={product.name}
                  image={product.image_url || "/placeholder.svg"}
                  price={product.base_price}
                  originalPrice={
                    product.original_price && product.original_price > product.base_price
                      ? product.original_price
                      : undefined
                  }
                  discount={
                    product.original_price && product.original_price > product.base_price
                      ? `-${Math.round(((product.original_price - product.base_price) / product.original_price) * 100)}%`
                      : undefined
                  }
                  category={product.category?.name}
                  productType={product.product_type}
                  instantDelivery
                  bestSeller={product.is_featured}
                  outOfStock={product.stock_quantity === 0}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No products yet</h3>
              <p className="text-[12px] text-muted-foreground mb-4 max-w-xs">
                Products in this category are coming soon. Check back later.
              </p>
              <Link
                href={`/category/${parent.slug}`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-semibold hover:bg-primary/90 transition-colors"
              >
                Back to {parent.name}
              </Link>
            </div>
          )}
        </section>

        {/* ─── Server-rendered SEO content ─── */}
        <article className="sr-only" aria-hidden="true">
          <h2>{category.name} - {parent.name} at RoyalSewa Nepal</h2>
          <p>{description}</p>
          <p>
            Buy {category.name} online in Nepal from RoyalSewa. Browse our {parent.name} collection
            with instant digital delivery and payment options including eSewa, Khalti, ConnectIPS,
            Visa, and Mastercard. All products are 100% genuine with 24/7 customer support.
          </p>
          {products.length > 0 && (
            <>
              <h3>{category.name} Products Available in Nepal</h3>
              <ul>
                {products.map((p) => (
                  <li key={p.id}>
                    <a href={`${BASE}/product/${p.slug || p.id}`}>{p.name}</a>
                    {" - NPR "}{p.base_price.toLocaleString()}
                    {p.short_description && <span>. {p.short_description}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      </main>
      <Footer />
    </div>
  )
}
