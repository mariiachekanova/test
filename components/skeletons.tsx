"use client"

// Shared shimmer base
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-secondary/60 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  )
}

// ─── Product Card Skeleton ───
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <Shimmer className="aspect-square w-full rounded-none" />
      <div className="p-3 space-y-2.5">
        <Shimmer className="h-2.5 w-3/5" />
        <Shimmer className="h-3.5 w-4/5" />
        <div className="flex items-center gap-2 pt-0.5">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}

// ─── Product Grid Skeleton ───
export function ProductGridSkeleton({ count = 8, cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid ${cols} gap-3 sm:gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 60}ms` }} className="animate-[fadeIn_0.4s_ease-out_both]">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  )
}

// ─── Category Card Skeleton ───
export function CategoryCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
      <Shimmer className="w-12 h-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3.5 w-3/5" />
        <Shimmer className="h-2.5 w-2/5" />
      </div>
    </div>
  )
}

export function CategoriesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 60}ms` }} className="animate-[fadeIn_0.4s_ease-out_both]">
          <CategoryCardSkeleton />
        </div>
      ))}
    </div>
  )
}

// ─── Admin Table Row Skeleton ───
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
      <Shimmer className="w-9 h-9 rounded-lg shrink-0" />
      {Array.from({ length: cols }).map((_, i) => (
        <Shimmer key={i} className={`h-3 ${i === 0 ? "w-32 flex-1" : "w-16"}`} />
      ))}
    </div>
  )
}

export function AdminTableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/30">
        {Array.from({ length: cols + 1 }).map((_, i) => (
          <Shimmer key={i} className={`h-2.5 ${i === 0 ? "w-8" : i === 1 ? "w-28 flex-1" : "w-14"}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 50}ms` }} className="animate-[fadeIn_0.35s_ease-out_both]">
          <TableRowSkeleton cols={cols} />
        </div>
      ))}
    </div>
  )
}

// ─── Stat Card Skeleton ───
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Shimmer className="h-2.5 w-16" />
        <Shimmer className="h-7 w-7 rounded-md" />
      </div>
      <Shimmer className="h-6 w-12" />
      <Shimmer className="h-2 w-20" />
    </div>
  )
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 70}ms` }} className="animate-[fadeIn_0.4s_ease-out_both]">
          <StatCardSkeleton />
        </div>
      ))}
    </div>
  )
}

// ─── Order Card Skeleton ───
export function OrderCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Shimmer className="h-3.5 w-28" />
          <Shimmer className="h-2.5 w-20" />
        </div>
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <Shimmer className="w-8 h-8 rounded shrink-0" />
        <Shimmer className="w-8 h-8 rounded shrink-0" />
        <div className="flex-1" />
        <Shimmer className="h-4 w-20" />
      </div>
    </div>
  )
}

export function OrdersListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 70}ms` }} className="animate-[fadeIn_0.4s_ease-out_both]">
          <OrderCardSkeleton />
        </div>
      ))}
    </div>
  )
}

// ─── Full Page Skeleton (Account / Admin layout) ───
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* header placeholder */}
      <div className="h-14 border-b border-border/30 bg-card/50" />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        <Shimmer className="h-5 w-40" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ animationDelay: `${i * 80}ms` }} className="animate-[fadeIn_0.4s_ease-out_both]">
              <Shimmer className="h-24 rounded-xl" />
            </div>
          ))}
        </div>
        <Shimmer className="h-64 rounded-xl" />
      </main>
    </div>
  )
}

// ─── Account Dashboard Skeleton ───
export function AccountDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Shimmer className="w-16 h-16 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-5 w-36" />
          <Shimmer className="h-3 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ animationDelay: `${i * 70}ms` }} className="animate-[fadeIn_0.4s_ease-out_both]">
            <Shimmer className="h-20 rounded-xl" />
          </div>
        ))}
      </div>
      <Shimmer className="h-4 w-28" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} style={{ animationDelay: `${(i + 3) * 70}ms` }} className="animate-[fadeIn_0.4s_ease-out_both]">
            <Shimmer className="h-20 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Product Form Skeleton ───
export function ProductFormSkeleton() {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-40" />
        <div className="flex gap-2">
          <Shimmer className="h-8 w-16 rounded-lg" />
          <Shimmer className="h-8 w-28 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ animationDelay: `${i * 60}ms` }} className="animate-[fadeIn_0.35s_ease-out_both] space-y-1.5">
              <Shimmer className="h-2.5 w-20" />
              <Shimmer className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Shimmer className="aspect-square w-full max-w-[200px] rounded-xl" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Shimmer className="h-2.5 w-20" />
              <Shimmer className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
