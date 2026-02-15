import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <h1 className="text-lg font-bold text-foreground mb-1">Product Not Found</h1>
        <p className="text-[12px] text-muted-foreground mb-4">
          The product you are looking for does not exist or may have been removed.
        </p>
        <Link
          href="/store"
          className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-[12px] font-semibold hover:bg-primary/90 transition-colors"
        >
          Browse Store
        </Link>
      </div>
      <Footer />
    </div>
  )
}
