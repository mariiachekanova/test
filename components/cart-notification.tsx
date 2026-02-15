'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, X, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

interface CartNotificationItem {
  name: string
  image: string
  price: number
  variant?: string
}

let showNotificationFn: ((item: CartNotificationItem) => void) | null = null

export function triggerCartNotification(item: CartNotificationItem) {
  showNotificationFn?.(item)
}

export function CartNotification() {
  const { count } = useCart()
  const [item, setItem] = useState<CartNotificationItem | null>(null)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => { setVisible(false); setExiting(false); setItem(null) }, 200)
  }, [])

  useEffect(() => {
    showNotificationFn = (newItem: CartNotificationItem) => {
      setItem(newItem)
      setVisible(true)
      setExiting(false)
    }
    return () => { showNotificationFn = null }
  }, [])

  useEffect(() => {
    if (!visible || exiting) return
    const t = setTimeout(dismiss, 3000)
    return () => clearTimeout(t)
  }, [visible, exiting, dismiss])

  if (!visible || !item) return null

  return (
    <div className={`fixed z-[999] left-2 right-2 bottom-[calc(56px+env(safe-area-inset-bottom,0px))] md:left-auto md:right-4 md:bottom-4 md:w-[300px] transition-all duration-200 ease-out ${
      exiting
        ? 'translate-y-2 opacity-0 scale-[0.98]'
        : 'translate-y-0 opacity-100 scale-100'
    }`}>
      <div className="bg-card border border-border/70 rounded-lg overflow-hidden shadow-lg shadow-black/25">
        <div className="p-2.5 flex gap-2 items-center">
          {/* Thumbnail */}
          <div className="relative w-9 h-9 rounded-md overflow-hidden bg-secondary border border-border/40 flex-shrink-0">
            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="36px" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" strokeWidth={3} />
              <p className="text-[11px] font-medium text-foreground truncate">{item.name}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {item.variant && <span className="text-[9px] text-muted-foreground truncate">{item.variant}</span>}
              {item.variant && <span className="text-[9px] text-muted-foreground/40">{'|'}</span>}
              <span className="text-[10px] font-semibold text-primary whitespace-nowrap">NPR {item.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <Link
            href="/cart"
            onClick={dismiss}
            className="flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Cart ({count})
            <ArrowRight className="w-2.5 h-2.5" />
          </Link>

          <button onClick={dismiss} className="w-5 h-5 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer flex-shrink-0">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
