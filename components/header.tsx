"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  ShoppingCart, 
  ChevronDown, 
  Menu, 
  X, 
  HelpCircle,
  Globe,
  User,
  LogOut,
  Settings,
  ShoppingBag,
  Shield,
  LayoutDashboard,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { getCategories, type Category } from "@/lib/data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

const staticNavLinks = [
  { name: "Home", href: "/" },
  { name: "Store", href: "/store" },
  { name: "Blog", href: "/blog" },
]

const currencies = ["NPR", "USD", "EUR", "GBP", "BTC", "ETH"]
const languages = ["English", "Nepali"]

export function Header() {
  const router = useRouter()
  const { user, profile, signOut, isAdmin } = useAuth()
  const { count: cartCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState("NPR")
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([])

  useEffect(() => {
    getCategories({ parentOnly: true }).then(cats => {
      setDynamicCategories(cats as Category[])
    }).catch(() => {})
  }, [])

  const navLinks = [
    staticNavLinks[0],
    staticNavLinks[1],
    {
      name: "Categories",
      href: "/store",
      hasDropdown: dynamicCategories.length > 0,
      items: dynamicCategories.map(c => c.name),
    },
    ...staticNavLinks.slice(2),
  ]

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || ""
  const email = profile?.email || user?.email || ""
  const initial = displayName ? displayName.charAt(0).toUpperCase() : ""
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null
  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const UserAvatar = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const s = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-8 h-8" : "w-7 h-7"
    const fs = size === "sm" ? "text-[9px]" : size === "lg" ? "text-[11px]" : "text-[10px]"
    if (avatarUrl) return <img src={avatarUrl || "/placeholder.svg"} alt={displayName} className={`${s} rounded-full object-cover`} />
    return (
      <div className={`${s} rounded-full bg-primary flex items-center justify-center`}>
        <span className={`${fs} font-bold text-primary-foreground`}>{initial}</span>
      </div>
    )
  }

  const UserDropdownContent = () => (
    <DropdownMenuContent align="end" className="w-48 p-1.5 bg-card border-border">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <UserAvatar size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-[10px] text-muted-foreground truncate">{email}</p>
          {isAdmin && (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 mt-0.5 rounded text-[8px] font-semibold bg-primary/15 text-primary border border-primary/20">
              <Shield className="w-2 h-2" />
              Admin
            </span>
          )}
        </div>
      </div>
      <DropdownMenuSeparator className="bg-border my-1" />
      <DropdownMenuItem className="cursor-pointer text-[11px] py-1.5 px-2 rounded-md text-foreground" onClick={() => router.push("/account")}>
        <User className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
        Account Overview
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer text-[11px] py-1.5 px-2 rounded-md text-foreground" onClick={() => router.push("/account/orders")}>
        <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
        My Orders
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer text-[11px] py-1.5 px-2 rounded-md text-foreground" onClick={() => router.push("/account/settings")}>
        <Settings className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
        Settings
      </DropdownMenuItem>
      {isAdmin && (
        <>
          <DropdownMenuSeparator className="bg-border my-1" />
          <DropdownMenuItem className="cursor-pointer text-[11px] py-1.5 px-2 rounded-md text-primary" onClick={() => router.push("/admin")}>
            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
            Admin Dashboard
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuSeparator className="bg-border my-1" />
      <DropdownMenuItem variant="destructive" className="cursor-pointer text-[11px] py-1.5 px-2 rounded-md" onClick={handleSignOut}>
        <LogOut className="w-3.5 h-3.5 mr-1.5" />
        Log Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-xl border-b border-border/60">
      {/* Desktop Top Navbar */}
      <div className="hidden lg:block">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[52px]">
            <Link href="/" className="shrink-0 cursor-pointer group flex items-center gap-2.5">
              <Image
                src="/images/logo.png"
                alt="Premium Subscriptions Nepal"
                width={36}
                height={36}
                className="rounded-full group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-serif text-[20px] font-bold tracking-[-0.02em] leading-none text-foreground">Premium <span className="text-primary">Subscriptions</span></span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="#" className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-primary font-medium rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
                <span>Help</span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 text-[13px] text-muted-foreground hover:text-primary font-medium rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                    <span>{selectedCurrency}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-28 p-1.5 bg-card border-border">
                  {currencies.map((c) => (
                    <DropdownMenuItem key={c} className="cursor-pointer text-[13px] py-2 px-3 rounded-md text-foreground hover:text-primary" onClick={() => setSelectedCurrency(c)}>{c}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-muted-foreground hover:text-primary font-medium rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                    <Globe className="h-4 w-4" strokeWidth={1.75} />
                    <span>{selectedLanguage}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 p-1.5 bg-card border-border">
                  {languages.map((l) => (
                    <DropdownMenuItem key={l} className="cursor-pointer text-[13px] py-2 px-3 rounded-md text-foreground hover:text-primary" onClick={() => setSelectedLanguage(l)}>{l}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Second Navbar */}
      <div className="hidden lg:block border-t border-border bg-card/50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[40px]">
            <nav className="flex items-center gap-0">
              {navLinks.map((item) => (
                item.hasDropdown ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-muted-foreground hover:text-primary font-medium transition-colors duration-150 rounded-md hover:bg-secondary cursor-pointer">
                        {item.name}
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40 p-1 bg-card border-border">
                      {item.items?.map((sub) => (
                        <DropdownMenuItem key={sub} className="cursor-pointer text-[11px] py-1.5 px-2 rounded-md text-foreground hover:text-primary">{sub}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link key={item.name} href={item.href} className="nav-link px-2.5 py-1.5 text-[12px] text-muted-foreground hover:text-foreground font-medium transition-colors duration-150 rounded-md hover:bg-secondary/60 cursor-pointer">{item.name}</Link>
                )
              ))}
            </nav>
            {/* Right icons */}
            <div className="flex items-center gap-1">
              <Link href="/search" className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary transition-colors cursor-pointer">
                <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </Link>
              {/* User Dropdown - Desktop */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-secondary transition-colors cursor-pointer">
                      <UserAvatar size="md" />
                    </button>
                  </DropdownMenuTrigger>
                  <UserDropdownContent />
                </DropdownMenu>
              ) : (
                <Link href="/account/signin" className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </Link>
              )}

              <Link href="/cart" className="relative flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary transition-colors cursor-pointer">
                <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======= MOBILE ======= */}
      <div className="lg:hidden">
        <div className="px-4">
          <div className="flex items-center justify-between h-[52px]">
            <Link href="/" className="shrink-0 cursor-pointer group flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Premium Subscriptions Nepal"
                width={32}
                height={32}
                className="rounded-full group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-serif text-[17px] font-bold tracking-[-0.02em] leading-none text-foreground">Premium <span className="text-primary">Subs</span></span>
            </Link>
            <div className="flex items-center gap-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-0.5 px-2 py-1.5 text-[12px] text-muted-foreground hover:text-primary font-medium rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                    <span>{selectedCurrency}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-28 p-1 bg-card border-border">
                  {currencies.map((c) => (
                    <DropdownMenuItem key={c} className="cursor-pointer text-[13px] py-1.5 px-2 rounded-md text-foreground" onClick={() => setSelectedCurrency(c)}>{c}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Second Bar - with dropdown for user */}
      <div className="lg:hidden border-t border-border bg-card/30">
        <div className="px-4 py-1.5">
          <div className="flex items-center justify-start gap-1">
            <Link href="/search" className="flex items-center justify-center w-11 h-11 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              <Search className="h-[22px] w-[22px]" strokeWidth={1.75} />
            </Link>
            {/* User Dropdown - Mobile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                    <UserAvatar size="md" />
                  </button>
                </DropdownMenuTrigger>
                <UserDropdownContent />
              </DropdownMenu>
            ) : (
              <Link href="/account/signin" className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                <User className="h-[22px] w-[22px] text-muted-foreground" strokeWidth={1.75} />
              </Link>
            )}

            <Link href="/cart" className="relative flex items-center justify-center w-11 h-11 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-card overflow-hidden"
          >
            <div className="px-4 py-3">
              <div className="flex flex-col gap-0.5">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3 text-[15px] text-muted-foreground hover:text-primary hover:bg-secondary rounded-xl transition-colors font-medium cursor-pointer"
                    onClick={() => !item.hasDropdown && setMobileMenuOpen(false)}
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </Link>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <UserAvatar size="md" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-foreground truncate">{displayName}</p>
                        <p className="text-[12px] text-muted-foreground truncate">{email}</p>
                      </div>
                      {isAdmin && (
                        <span className="ml-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/15 text-primary border border-primary/20 shrink-0">
                          <Shield className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      )}
                    </div>
                    <Link href="/account" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-5 w-5" />
                      My Account
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-primary text-primary font-medium rounded-xl hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={async () => { await handleSignOut(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-destructive hover:bg-destructive/10 font-medium rounded-xl transition-colors cursor-pointer">
                      <LogOut className="h-5 w-5" />
                      Log Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/account/signin"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
