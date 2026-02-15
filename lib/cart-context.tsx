"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

const STORAGE_KEY = "giftcard_cart"

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    image_url: string | null
    base_price: number
    original_price: number
    product_type: string
    category_name?: string
  }
  plan?: { id: string; plan_name: string } | null
  duration?: { id: string; duration_name: string; price: number; original_price: number } | null
  denomination?: { id: string; amount: number; original_price: number } | null
  added_at: string
}

interface AddToCartOpts {
  product: CartItem["product"]
  plan?: CartItem["plan"]
  duration?: CartItem["duration"]
  denomination?: CartItem["denomination"]
  quantity?: number
}

interface CartContextType {
  items: CartItem[]
  count: number
  addToCart: (opts: AddToCartOpts) => boolean
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* quota exceeded */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(readCart())
    setHydrated(true)
  }, [])

  // Persist to localStorage on every change (after hydration)
  useEffect(() => {
    if (hydrated) writeCart(items)
  }, [items, hydrated])

  const addToCart = useCallback((opts: AddToCartOpts): boolean => {
    setItems(prev => {
      // Check for existing same product + variant
      const existing = prev.find(i =>
        i.product_id === opts.product.id &&
        (i.plan?.id || null) === (opts.plan?.id || null) &&
        (i.duration?.id || null) === (opts.duration?.id || null) &&
        (i.denomination?.id || null) === (opts.denomination?.id || null)
      )

      if (existing) {
        return prev.map(i =>
          i.id === existing.id ? { ...i, quantity: i.quantity + (opts.quantity || 1) } : i
        )
      }

      const newItem: CartItem = {
        id: generateId(),
        product_id: opts.product.id,
        quantity: opts.quantity || 1,
        product: opts.product,
        plan: opts.plan || null,
        duration: opts.duration || null,
        denomination: opts.denomination || null,
        added_at: new Date().toISOString(),
      }

      return [...prev, newItem]
    })
    return true
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems(prev => prev.filter(i => i.id !== id))
      return
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => {
      let price = item.product.base_price
      if (item.duration) price = item.duration.price
      else if (item.denomination) price = item.denomination.amount
      return sum + price * item.quantity
    }, 0)
  }, [items])

  return (
    <CartContext.Provider value={{
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getSubtotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}
