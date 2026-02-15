"use client"

import { useCallback, useRef } from "react"
import { Heart, Star, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { preload } from "swr"
import { productFetcher } from "@/lib/product-fetcher"

interface ProductCardProps {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  currency?: string
  discount?: string
  rating?: number
  category?: string
  productType?: string
  outOfStock?: boolean
  instantDelivery?: boolean
  bestSeller?: boolean
}

export function ProductCard({
  id, name, image, price, originalPrice, currency = "NPR",
  discount, rating = 5, category, productType,
  outOfStock = false, instantDelivery = true, bestSeller = false,
}: ProductCardProps) {
  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  // Prefetch product data on hover / touch so the page loads instantly
  const prefetched = useRef(false)
  const handlePrefetch = useCallback(() => {
    if (prefetched.current) return
    prefetched.current = true
    preload(`product-${id}`, () => productFetcher(id))
  }, [id])

  return (
    <Link
      href={`/product/${id}`}
      className="block h-full group cursor-pointer"
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <div className={`bg-card rounded-lg sm:rounded-xl overflow-hidden border border-border/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 h-full flex flex-col ${outOfStock ? "opacity-70" : ""}`}>
        {/* Image */}
        <div className="relative w-full aspect-square overflow-hidden bg-secondary">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1">
            {discount && !outOfStock && (
              <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold text-white bg-red-500 leading-tight">{discount}</span>
            )}
            {outOfStock && (
              <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold text-white bg-muted-foreground leading-tight">Sold Out</span>
            )}
            {bestSeller && !outOfStock && (
              <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold text-primary-foreground bg-primary leading-tight">Featured</span>
            )}
          </div>
          {instantDelivery && !outOfStock && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-semibold text-primary-foreground bg-primary/90 leading-tight">
                <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current" />
                <span className="hidden sm:inline">Instant</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2 sm:p-2.5 flex flex-col flex-1">
          {/* Category / Type */}
          {(category || productType) && (
            <span className="text-[8px] sm:text-[9px] text-primary/70 uppercase tracking-wider font-semibold mb-0.5 truncate">
              {category || productType?.replace("_", " ")}
            </span>
          )}

          <h3 className="font-semibold text-foreground text-[11px] sm:text-[12px] leading-snug line-clamp-2 mb-1 sm:mb-1.5">{name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground/20 fill-muted-foreground/20"}`} />
            ))}
            <span className="text-[8px] sm:text-[9px] text-muted-foreground ml-0.5">({rating.toFixed(1)})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 sm:gap-1.5 mt-auto pt-1 sm:pt-1.5 border-t border-border/40">
            <span className="text-[12px] sm:text-[13px] font-bold text-primary">{currency} {price.toLocaleString()}</span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-[8px] sm:text-[9px] text-muted-foreground line-through">{currency} {originalPrice.toLocaleString()}</span>
                {discountPercent && (
                  <span className="text-[7px] sm:text-[8px] font-bold text-red-400 bg-red-500/10 px-1 py-px rounded">-{discountPercent}%</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
