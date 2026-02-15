import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FolderOpen } from "lucide-react"

export default function ChildCategoryNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <FolderOpen className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-bold text-foreground mb-1">Subcategory Not Found</h1>
        <p className="text-[12px] text-muted-foreground mb-4 max-w-xs">
          The subcategory you are looking for does not exist or has been removed.
        </p>
        <div className="flex items-center gap-2">
          <Link href="/store" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-semibold hover:bg-primary/90 transition-colors">
            Browse Store
          </Link>
          <Link href="/" className="px-4 py-2 bg-secondary text-foreground rounded-lg text-[12px] font-semibold hover:bg-secondary/80 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
