"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="w-full border-b border-border/40 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <ol className="flex items-center gap-1 text-[11px] sm:text-[12px] flex-wrap">
          <li className="flex items-center gap-1">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
              {item.href ? (
                <Link href={item.href} className="text-muted-foreground hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px]">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground/70 truncate max-w-[140px] sm:max-w-[220px]">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
