import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <h1 className="text-lg font-bold text-foreground mb-1">Post Not Found</h1>
        <p className="text-[12px] text-muted-foreground mb-4">
          This blog post does not exist or has been removed.
        </p>
        <Link
          href="/blog"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-semibold hover:bg-primary/90 transition-colors"
        >
          Browse Blog
        </Link>
      </div>
      <Footer />
    </div>
  )
}
