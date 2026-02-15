import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 animate-pulse">
        <div className="h-3 w-48 bg-secondary rounded mb-6" />
        <div className="h-8 w-4/5 bg-secondary rounded mb-2" />
        <div className="h-7 w-3/5 bg-secondary rounded mb-4" />
        <div className="flex gap-4 mb-6">
          <div className="h-3 w-20 bg-secondary rounded" />
          <div className="h-3 w-24 bg-secondary rounded" />
          <div className="h-3 w-16 bg-secondary rounded" />
        </div>
        <div className="aspect-[2/1] rounded-xl bg-secondary mb-8" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-3 bg-secondary rounded" style={{ width: `${90 - i * 4}%` }} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
