"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, MessageCircle, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  slug: string
}

const shopLinks = [
  { label: "All Products", href: "/store" },
  { label: "Subscriptions", href: "/store?type=subscription" },
  { label: "Gift Cards", href: "/store?type=gift_card" },
  { label: "Games", href: "/store?type=game" },
  { label: "Search", href: "/search" },
]

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
]

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "My Orders", href: "/account/orders" },
  { label: "My Account", href: "/account" },
]

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/9779869671451" },
]

const paymentBrands = ["eSewa", "Khalti", "ConnectIPS", "Visa", "Mastercard"]

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("categories")
      .select("id, name, slug")
      .is("parent_id", null)
      .eq("is_active", true)
      .order("display_order")
      .limit(8)
      .then(({ data }) => {
        if (data) setCategories(data as Category[])
      })
  }, [])

  return (
    <footer className="bg-card/80 border-t border-border/60 backdrop-blur-sm">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center amber-glow-sm">
                <span className="text-primary-foreground font-bold text-[10px]">R</span>
              </div>
              <span className="text-[15px] font-semibold text-primary">RoyalSewa</span>
            </Link>
            <p className="text-muted-foreground text-[12px] leading-relaxed mb-3">
              Nepal&apos;s trusted digital subscription provider. Buy Netflix, Spotify, YouTube Premium, game top-ups & software. Pay with eSewa, Khalti, ConnectIPS.
            </p>
            {/* Contact */}
            <div className="flex flex-col gap-1 mb-3">
              <a
                href="https://wa.me/9779869671451"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] text-primary font-semibold hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                +977 9869671451
              </a>
              <a
                href="mailto:support@royalsewa.com"
                className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-3 h-3" />
                support@royalsewa.com
              </a>
            </div>
            {/* Social */}
            <div className="flex items-center gap-1.5">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <social.icon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Categories -- dynamic */}
          <div>
            <h4 className="font-semibold text-foreground text-[13px] mb-3">Categories</h4>
            <ul className="space-y-1.5">
              {categories.length > 0 ? categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="text-muted-foreground text-[12px] hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              )) : (
                // Fallback while loading
                <>
                  {shopLinks.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-muted-foreground text-[12px] hover:text-primary transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-foreground text-[13px] mb-3">Shop</h4>
            <ul className="space-y-1.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground text-[12px] hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-semibold text-foreground text-[13px] mb-3">Company</h4>
            <ul className="space-y-1.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground text-[12px] hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground text-[13px] mb-3">Support</h4>
            <ul className="space-y-1.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground text-[12px] hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="https://wa.me/9779869671451" target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-[12px] hover:text-primary transition-colors">
                  WhatsApp: +977 9869671451
                </a>
              </li>
              <li>
                <a href="mailto:support@royalsewa.com" className="text-muted-foreground text-[12px] hover:text-primary transition-colors">
                  support@royalsewa.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t border-border pt-6 mb-6">
          <h4 className="text-[12px] font-medium text-muted-foreground mb-3">Payment Methods</h4>
          <div className="flex flex-wrap gap-1.5">
            {paymentBrands.map((brand) => (
              <span key={brand} className="px-2.5 py-1 bg-secondary rounded text-[11px] text-muted-foreground font-medium border border-border">
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-muted-foreground text-[11px]">
            &copy; 2026 RoyalSewa. All rights reserved. Product trademarks belong to their respective owners.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="/refund" className="text-muted-foreground hover:text-primary transition-colors">Refunds</Link>
            <Link href="/sitemap.xml" className="text-muted-foreground hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
