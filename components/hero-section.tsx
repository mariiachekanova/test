"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { ShoppingCart, ArrowRight, Zap, Shield, Clock, Truck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface SlideItem {
  id: string
  title: string
  description: string
  price: number
  originalPrice: number
  image: string
  link: string
  badge: string
}

/* ──────────── Skeleton ──────────── */
function HeroSkeleton() {
  return (
    <section className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
        <div className="relative rounded-2xl sm:rounded-3xl border border-border/50 bg-card overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-8 lg:gap-10 p-5 sm:p-8 lg:p-10">
            {/* Text skeleton (below image on mobile, left on desktop) */}
            <div className="flex-1 min-w-0 space-y-4 order-2 lg:order-1">
              <div className="h-5 w-40 rounded-full bg-secondary/60 animate-pulse" />
              <div className="space-y-2.5">
                <div className="h-8 sm:h-10 w-4/5 rounded-lg bg-secondary/60 animate-pulse" />
                <div className="h-8 sm:h-10 w-3/5 rounded-lg bg-secondary/60 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full max-w-sm rounded bg-secondary/40 animate-pulse" />
                <div className="h-4 w-3/4 max-w-xs rounded bg-secondary/40 animate-pulse" />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="h-8 w-24 rounded-lg bg-secondary/60 animate-pulse" />
                <div className="h-5 w-16 rounded bg-secondary/40 animate-pulse" />
                <div className="h-5 w-14 rounded-full bg-secondary/40 animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <div className="h-10 w-32 rounded-xl bg-primary/20 animate-pulse" />
                <div className="h-10 w-28 rounded-xl bg-secondary/50 animate-pulse" />
              </div>
            </div>
            {/* Image skeleton (top on mobile, right on desktop) -- fanned stack */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 order-1 lg:order-2">
              <div className="px-10 sm:px-14 lg:px-8" style={{ perspective: "1200px" }}>
                <div className="relative mx-auto" style={{ width: "min(240px, 55vw)", aspectRatio: "3/4", transformStyle: "preserve-3d" as const }}>
                  {[-1, 0, 1].map((offset) => {
                    const abs = Math.abs(offset)
                    return (
                      <div
                        key={offset}
                        className="absolute inset-0 rounded-2xl bg-secondary/60 animate-pulse ring-1 ring-white/[0.03]"
                        style={{
                          transform: `translateX(${offset * 72}px) translateZ(${-abs * 80}px) rotateY(${offset * -18}deg) rotate(${offset * 3}deg) scale(${1 - abs * 0.12})`,
                          transformStyle: "preserve-3d" as const,
                          zIndex: 10 - abs,
                          opacity: 1 - abs * 0.4,
                        }}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`rounded-full bg-secondary/50 animate-pulse ${i === 0 ? "w-5 h-[5px]" : "w-[5px] h-[5px]"}`} />
                ))}
              </div>
            </div>
          </div>
          {/* Bottom bar skeleton */}
          <div className="border-t border-border/30 mx-5 sm:mx-8 lg:mx-10" />
          <div className="flex items-center justify-between px-5 sm:px-8 lg:px-10 py-3">
            <div className="flex items-center gap-4">
              <div className="h-3 w-20 rounded bg-secondary/40 animate-pulse" />
              <div className="h-3 w-20 rounded bg-secondary/40 animate-pulse" />
              <div className="h-3 w-24 rounded bg-secondary/40 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────── Empty state ──────────── */
function HeroEmpty() {
  return (
    <section className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
        <div className="relative rounded-2xl sm:rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/80 overflow-hidden p-8 sm:p-12 text-center">
          <div className="absolute top-0 left-0 w-48 h-48 bg-primary/[0.04] blur-3xl rounded-full pointer-events-none" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 text-balance">
            Nepal{"'"}s Trusted <span className="text-primary">Digital Store</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-6">
            Buy Netflix, Spotify, YouTube Premium & more. Pay with eSewa, Khalti, ConnectIPS. Instant delivery.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:brightness-110 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Browse Store
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ──────────── Main Hero ──────────── */
export function HeroSection() {
  const [slides, setSlides] = useState<SlideItem[] | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch from DB
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSlides(
            data.map((s) => ({
              id: s.id,
              title: s.title || "",
              description: s.description || "",
              price: s.price || 0,
              originalPrice: s.original_price || 0,
              image: s.image_url || "/placeholder.svg",
              link: s.link_url || "/store",
              badge: s.badge_text || "Best Deals in Nepal",
            }))
          )
        } else {
          setSlides([])
        }
      })
  }, [])

  const goTo = useCallback(
    (index: number, dir: "next" | "prev" = "next") => {
      if (!slides || slides.length === 0) return
      setDirection(dir)
      setActiveIndex(((index % slides.length) + slides.length) % slides.length)
    },
    [slides]
  )

  // Auto-play
  useEffect(() => {
    if (!slides || slides.length <= 1) return
    intervalRef.current = setInterval(() => {
      setDirection("next")
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 5500)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [slides])

  // Reset timer on manual dot click
  const handleDotClick = useCallback(
    (index: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      goTo(index, index > activeIndex ? "next" : "prev")
      if (slides && slides.length > 1) {
        intervalRef.current = setInterval(() => {
          setDirection("next")
          setActiveIndex((prev) => (prev + 1) % (slides?.length || 1))
        }, 5500)
      }
    },
    [activeIndex, goTo, slides]
  )

  // Loading
  if (slides === null) return <HeroSkeleton />
  // No slides configured
  if (slides.length === 0) return <HeroEmpty />

  const active = slides[activeIndex]
  const discount =
    active.originalPrice > active.price
      ? Math.round(((active.originalPrice - active.price) / active.originalPrice) * 100)
      : 0

  const animClass = direction === "next" ? "hero-slide-in-right" : "hero-slide-in-left"

  return (
    <section className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
        <div className="relative rounded-2xl sm:rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/80 overflow-hidden shadow-[0_4px_24px_hsl(0_0%_0%/0.3),0_0_0_1px_hsl(0_0%_100%/0.02)]">
          {/* Ambient glow */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-primary/[0.04] blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/[0.03] blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-5 sm:gap-8 lg:gap-10 p-5 sm:p-8 lg:p-10">
            {/* ─── Content (below image on mobile, left on desktop) ─── */}
            <div className="flex-1 min-w-0 order-2 lg:order-1">
              {/* Badge */}
              <div
                key={`badge-${activeIndex}`}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 mb-3 sm:mb-4 ${animClass}`}
              >
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-primary text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
                  {active.badge}
                </span>
              </div>

              {/* Title */}
              <h1
                key={`title-${activeIndex}`}
                className={`text-[22px] sm:text-[28px] lg:text-[36px] font-bold text-foreground leading-[1.12] mb-2.5 sm:mb-3 text-balance ${animClass}`}
                style={{ animationDelay: "50ms" }}
              >
                {active.title}
              </h1>

              {/* Description */}
              <p
                key={`desc-${activeIndex}`}
                className={`text-muted-foreground text-[12px] sm:text-[13px] lg:text-[14px] leading-relaxed max-w-md mb-4 sm:mb-5 ${animClass}`}
                style={{ animationDelay: "100ms" }}
              >
                {active.description}
              </p>

              {/* Price */}
              {active.price > 0 && (
                <div
                  key={`price-${activeIndex}`}
                  className={`flex items-baseline gap-2.5 sm:gap-3 mb-4 sm:mb-5 flex-wrap ${animClass}`}
                  style={{ animationDelay: "140ms" }}
                >
                  <span className="text-primary font-bold text-[22px] sm:text-[26px] lg:text-[28px] tracking-tight">
                    NPR {active.price.toLocaleString()}
                  </span>
                  {active.originalPrice > active.price && (
                    <>
                      <span className="text-muted-foreground line-through text-[12px] sm:text-[13px]">
                        NPR {active.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div
                key={`cta-${activeIndex}`}
                className={`flex items-center gap-2.5 mb-4 sm:mb-5 flex-wrap ${animClass}`}
                style={{ animationDelay: "180ms" }}
              >
                <Link
                  href={active.link}
                  className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-[12px] sm:text-[13px] rounded-xl shadow-[0_1px_3px_hsl(0_0%_0%/0.3),inset_0_1px_0_hsl(0_0%_100%/0.12)] hover:shadow-[0_4px_20px_hsl(38_92%_50%/0.25)] hover:brightness-110 active:scale-[0.97] transition-all duration-200"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-0 -ml-2.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </Link>
                <Link
                  href="/store"
                  className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 border border-border/70 text-foreground font-medium text-[12px] sm:text-[13px] rounded-xl hover:border-primary/30 hover:text-primary active:scale-[0.97] transition-all duration-200"
                >
                  Browse All
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap text-[10px] sm:text-[11px] text-muted-foreground/70">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span>4.9/5</span>
                </div>
                <span className="w-px h-2.5 bg-border/60" />
                <span>50K+ Sold</span>
                <span className="w-px h-2.5 bg-border/60" />
                <span>Instant Delivery</span>
              </div>
            </div>

            {/* ─── Fanned Image Carousel (top on mobile, right on desktop) ─── */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 order-1 lg:order-2">
              {/* Outer perspective wrapper -- extra horizontal padding for fanned overflow */}
              <div className="px-10 sm:px-14 lg:px-8" style={{ perspective: "1200px" }}>
                {/* Inner positioned container */}
                <div
                  className="relative mx-auto"
                  style={{
                    width: "min(240px, 55vw)",
                    aspectRatio: "3 / 4",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {slides.map((slide, index) => {
                    const total = slides.length
                    const raw = index - activeIndex
                    const half = Math.floor(total / 2)
                    let offset = raw
                    if (offset > half) offset -= total
                    if (offset < -half) offset += total

                    const abs = Math.abs(offset)
                    const isActive = offset === 0
                    const maxVisible = 2
                    const hidden = abs > maxVisible
                    const sign = offset > 0 ? 1 : offset < 0 ? -1 : 0

                    // Fanned transforms -- strong visual spread
                    const rotateY = offset * -18
                    const translateXVal = offset * 72
                    const translateZ = -abs * 80
                    const rotateZ = offset * 3
                    const scaleVal = isActive ? 1 : Math.max(0.78, 1 - abs * 0.12)
                    const opacityVal = hidden ? 0 : isActive ? 1 : Math.max(0.35, 0.85 - abs * 0.25)

                    return (
                      <Link
                        key={slide.id}
                        href={slide.link}
                        className="absolute inset-0 block rounded-2xl overflow-hidden ring-1 ring-white/[0.06]"
                        style={{
                          zIndex: 20 - abs,
                          opacity: opacityVal,
                          transform: [
                            `translateX(${translateXVal}px)`,
                            `translateZ(${translateZ}px)`,
                            `rotateY(${rotateY}deg)`,
                            `rotate(${rotateZ}deg)`,
                            `scale(${scaleVal})`,
                          ].join(" "),
                          transformStyle: "preserve-3d",
                          transition: "all 0.7s cubic-bezier(0.32, 0.72, 0, 1)",
                          pointerEvents: isActive ? "auto" : "none",
                          boxShadow: isActive
                            ? "0 12px 48px hsl(0 0% 0% / 0.55), 0 0 0 1px hsl(0 0% 100% / 0.04)"
                            : `${sign * 6}px 8px 24px hsl(0 0% 0% / 0.4)`,
                        }}
                        tabIndex={isActive ? 0 : -1}
                        aria-hidden={!isActive}
                      >
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                          sizes="(max-width: 1024px) 240px, 340px"
                        />
                        {/* Bottom gradient overlay -- only visible on active */}
                        <div
                          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 sm:p-3.5 pt-10 sm:pt-14 transition-opacity duration-500"
                          style={{ opacity: isActive ? 1 : 0 }}
                        >
                          <h3 className="text-white font-semibold text-[11px] sm:text-[13px] leading-tight mb-0.5 line-clamp-1">
                            {slide.title}
                          </h3>
                          <div className="flex items-baseline gap-1.5">
                            {slide.price > 0 && (
                              <span className="text-primary font-bold text-[12px] sm:text-[14px]">
                                NPR {slide.price.toLocaleString()}
                              </span>
                            )}
                            {slide.originalPrice > slide.price && (
                              <span className="text-white/30 text-[9px] sm:text-[10px] line-through">
                                NPR {slide.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Discount badge */}
                        {isActive && slide.originalPrice > slide.price && (
                          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 px-1.5 py-0.5 bg-primary text-primary-foreground text-[8px] sm:text-[9px] font-bold rounded-md shadow-md">
                            -{Math.round(((slide.originalPrice - slide.price) / slide.originalPrice) * 100)}%
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Dot indicators */}
              {slides.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-5 sm:mt-6">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDotClick(idx)}
                      className={`rounded-full transition-all duration-400 cursor-pointer ${
                        idx === activeIndex
                          ? "bg-primary w-6 h-[5px] shadow-[0_0_8px_hsl(38_92%_50%/0.35)]"
                          : "bg-muted-foreground/15 hover:bg-muted-foreground/30 w-[5px] h-[5px]"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Bottom trust bar ─── */}
          <div className="border-t border-border/30 mx-5 sm:mx-8 lg:mx-10" />
          <div className="flex items-center justify-between px-5 sm:px-8 lg:px-10 py-2.5 sm:py-3">
            <div className="flex items-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] text-muted-foreground/50">
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Secure Checkout
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                24/7 Support
              </span>
              <span className="inline-flex items-center gap-1">
                <Truck className="w-3 h-3" />
                Instant Delivery
              </span>
            </div>
            <span className="hidden sm:block text-[10px] sm:text-[11px] text-muted-foreground/40">
              Trusted by 50,000+ customers in Nepal
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroSlideInRight {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroSlideInLeft {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-slide-in-right {
          animation: heroSlideInRight 0.45s ease-out both;
        }
        .hero-slide-in-left {
          animation: heroSlideInLeft 0.45s ease-out both;
        }
      `}</style>
    </section>
  )
}
