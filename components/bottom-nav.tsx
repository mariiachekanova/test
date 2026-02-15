"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { Home, Search, ShoppingBag, ShoppingCart, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Store", href: "/store", icon: ShoppingBag },
  { label: "Cart", href: "/cart", icon: ShoppingCart, badge: true },
  { label: "Account", href: "/account", icon: User, auth: true },
]

const SCROLL_THRESHOLD = 12

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { count: cartCount } = useCart()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const handleScroll = useCallback(() => {
    if (ticking.current) return
    ticking.current = true

    requestAnimationFrame(() => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current

      // At the very top -- always show
      if (currentY < 10) {
        setVisible(true)
      }
      // Scrolling down past threshold -- hide
      else if (delta > SCROLL_THRESHOLD) {
        setVisible(false)
      }
      // Scrolling up past threshold -- show
      else if (delta < -SCROLL_THRESHOLD) {
        setVisible(true)
      }

      lastScrollY.current = currentY
      ticking.current = false
    })
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Always show on route change
  useEffect(() => {
    setVisible(true)
    lastScrollY.current = window.scrollY
  }, [pathname])

  if (pathname.startsWith("/admin")) return null

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 md:hidden transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-label="Mobile navigation"
    >
      <div className="absolute inset-0 bg-card/90 backdrop-blur-2xl border-t border-border/40" />
      <div
        className="relative grid grid-cols-5 h-[52px] px-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {items.map((item) => {
          const Icon = item.icon
          const href = item.auth && !user ? "/account/signin" : item.href
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

          return (
            <Link
              key={item.label}
              href={href}
              className="flex flex-col items-center justify-center gap-[2px] relative"
            >
              {isActive && (
                <span className="absolute top-0 w-6 h-[2px] rounded-full bg-primary" />
              )}
              <span className="relative">
                <Icon
                  className={`w-[18px] h-[18px] transition-colors duration-150 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                {item.badge && cartCount > 0 && (
                  <span className="absolute -top-[3px] -right-[5px] w-[12px] h-[12px] rounded-full bg-primary text-[7px] font-bold text-primary-foreground flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[9px] leading-none ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
