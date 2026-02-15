import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 animate-pulse">
        <div className="flex gap-2 mb-6">
          <div className="h-3 w-10 bg-secondary rounded" />
          <div className="h-3 w-3 bg-secondary rounded" />
          <div className="h-3 w-10 bg-secondary rounded" />
          <div className="h-3 w-3 bg-secondary rounded" />
          <div className="h-3 w-24 bg-secondary rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="aspect-square rounded-xl bg-secondary" />
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-secondary rounded" />
              <div className="h-4 w-14 bg-secondary rounded-full" />
            </div>
            <div className="h-5 w-3/4 bg-secondary rounded" />
            <div className="h-3 w-full bg-secondary rounded" />
            <div className="h-3 w-2/3 bg-secondary rounded" />
            <div className="h-6 w-32 bg-secondary rounded mt-2" />
            <div className="space-y-1.5 pt-2">
              <div className="h-10 w-full bg-secondary rounded-lg" />
              <div className="h-10 w-full bg-secondary rounded-lg" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-8 w-24 bg-secondary rounded-lg" />
              <div className="h-8 flex-1 bg-secondary rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
