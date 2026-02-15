import { Header } from "@/components/header"

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-secondary/60 rounded-lg ${className}`} />
}

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Breadcrumb skeleton */}
      <div className="border-b border-border/30 bg-card/30">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-2.5">
          <div className="flex items-center gap-2">
            <Shimmer className="w-10 h-3 rounded" />
            <Shimmer className="w-3 h-3 rounded-full" />
            <Shimmer className="w-14 h-3 rounded" />
          </div>
        </div>
      </div>

      <main className="flex-1 py-6 lg:py-8">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          {/* Title */}
          <div className="mb-6">
            <Shimmer className="w-36 h-5 mb-1.5" />
            <Shimmer className="w-52 h-3" />
          </div>

          {/* Steps progress bar */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Shimmer className="w-7 h-7 rounded-full" />
                  <Shimmer className="w-16 h-3 hidden sm:block" />
                </div>
                {i < 3 && <Shimmer className="w-8 h-0.5 rounded" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Main content area */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border/40 rounded-xl p-5">
                {/* Form heading */}
                <Shimmer className="w-40 h-4 mb-5" />

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <Shimmer className="w-20 h-3 mb-1.5" />
                    <Shimmer className="w-full h-10 rounded-lg" />
                  </div>
                  <div>
                    <Shimmer className="w-16 h-3 mb-1.5" />
                    <Shimmer className="w-full h-10 rounded-lg" />
                  </div>
                  <div>
                    <Shimmer className="w-24 h-3 mb-1.5" />
                    <Shimmer className="w-full h-10 rounded-lg" />
                  </div>
                  <div>
                    <Shimmer className="w-28 h-3 mb-1.5" />
                    <Shimmer className="w-full h-20 rounded-lg" />
                  </div>
                </div>

                {/* Button */}
                <Shimmer className="w-full h-10 rounded-lg mt-6" />
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3">
                <Shimmer className="w-28 h-4 mb-3" />

                {/* Cart items skeleton */}
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3 py-2.5 border-b border-border/30 last:border-0">
                    <Shimmer className="w-12 h-12 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Shimmer className="w-3/4 h-3" />
                      <Shimmer className="w-1/2 h-2.5" />
                      <Shimmer className="w-20 h-3" />
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="pt-2 border-t border-border/30 space-y-2">
                  <div className="flex justify-between">
                    <Shimmer className="w-16 h-3" />
                    <Shimmer className="w-20 h-3" />
                  </div>
                  <div className="flex justify-between">
                    <Shimmer className="w-14 h-3" />
                    <Shimmer className="w-12 h-3" />
                  </div>
                </div>
                <div className="pt-2 border-t border-border/30 flex justify-between">
                  <Shimmer className="w-12 h-4" />
                  <Shimmer className="w-24 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
