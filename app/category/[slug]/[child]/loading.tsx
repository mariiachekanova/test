import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ChildCategoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-10 bg-secondary rounded" />
            <div className="h-3 w-3 bg-secondary rounded" />
            <div className="h-3 w-10 bg-secondary rounded" />
            <div className="h-3 w-3 bg-secondary rounded" />
            <div className="h-3 w-16 bg-secondary rounded" />
            <div className="h-3 w-3 bg-secondary rounded" />
            <div className="h-3 w-24 bg-secondary rounded" />
          </div>
        </div>
        {/* Hero skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
          <div className="rounded-2xl bg-card border border-border/60 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-secondary shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-3 w-32 bg-secondary/40 rounded" />
                <div className="h-6 sm:h-8 w-2/3 bg-secondary rounded-lg" />
                <div className="h-3 w-full max-w-sm bg-secondary/60 rounded" />
                <div className="h-3 w-28 bg-secondary/40 rounded" />
              </div>
            </div>
          </div>
        </div>
        {/* Product grid skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-44 bg-secondary rounded" />
            <div className="h-3 w-16 bg-secondary/60 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl bg-card border border-border/60 overflow-hidden">
                <div className="aspect-square bg-secondary" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-16 bg-secondary/60 rounded" />
                  <div className="h-4 w-full bg-secondary rounded" />
                  <div className="h-3 w-20 bg-secondary/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
