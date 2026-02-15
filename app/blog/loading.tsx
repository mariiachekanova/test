import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="h-8 w-32 bg-secondary rounded animate-pulse mb-2" />
        <div className="h-3 w-64 bg-secondary rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-secondary" />
              <div className="p-4 flex flex-col gap-2.5">
                <div className="h-3 w-24 bg-secondary rounded" />
                <div className="h-5 w-4/5 bg-secondary rounded" />
                <div className="h-3 w-full bg-secondary rounded" />
                <div className="h-3 w-3/4 bg-secondary rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
