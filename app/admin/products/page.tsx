"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Package, Plus, Search, Edit, Trash2, Eye, Filter, CreditCard, Gamepad2, RefreshCcw, EyeOff } from "lucide-react"
import { AdminTableSkeleton } from "@/components/skeletons"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  slug: string
  product_type: string
  base_price: number | null
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  image_url: string | null
  created_at: string
  categories: { name: string } | null
}

const typeIcons: Record<string, React.ElementType> = { gift_card: CreditCard, game: Gamepad2, subscription: RefreshCcw }
const typeLabels: Record<string, string> = { gift_card: "Gift Card", game: "Game", subscription: "Subscription" }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, product_type, base_price, stock_quantity, is_active, is_featured, image_url, created_at, categories(name)")
      .order("created_at", { ascending: false })

    if (error) {
      toast({ variant: "error", title: "Error", description: error.message })
    } else {
      setProducts((data as unknown as Product[]) || [])
    }
    setIsLoading(false)
  }

  const toggleActive = async (product: Product) => {
    const { error } = await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id)
    if (error) { toast({ variant: "error", title: "Error", description: error.message }) }
    else { fetchProducts() }
  }

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    const { error } = await supabase.from("products").delete().eq("id", product.id)
    if (error) { toast({ variant: "error", title: "Error", description: error.message }) }
    else { toast({ variant: "success", title: "Deleted", description: `${product.name} removed.` }); fetchProducts() }
  }

  const filtered = products.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = typeFilter === "all" || p.product_type === typeFilter
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? p.is_active : !p.is_active)
    return matchSearch && matchType && matchStatus
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    gift_cards: products.filter(p => p.product_type === "gift_card").length,
    games: products.filter(p => p.product_type === "game").length,
    subscriptions: products.filter(p => p.product_type === "subscription").length,
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Products
          </h1>
          <p className="text-xs text-muted-foreground">{stats.total} products | {stats.active} active</p>
        </div>
        <Link href="/admin/products/new" className="self-start flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Gift Cards", value: stats.gift_cards, color: "text-amber-500" },
          { label: "Games", value: stats.games, color: "text-blue-500" },
          { label: "Subscriptions", value: stats.subscriptions, color: "text-emerald-500" },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30">
          <option value="all">All Types</option>
          <option value="gift_card">Gift Cards</option>
          <option value="game">Games</option>
          <option value="subscription">Subscriptions</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <AdminTableSkeleton rows={5} cols={4} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-10 h-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No products found</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {products.length === 0 ? "Add your first product to get started." : "Try adjusting your filters."}
            </p>
            {products.length === 0 && (
              <Link href="/admin/products/new" className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Product</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Type</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Price</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Stock</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => {
                  const TypeIcon = typeIcons[product.product_type] || Package
                  return (
                    <tr key={product.id} className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            {product.image_url ? (
                              <img src={product.image_url || "/placeholder.svg"} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <TypeIcon className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground sm:hidden">{typeLabels[product.product_type]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-[11px] text-foreground">
                          <TypeIcon className="w-3 h-3 text-muted-foreground" />
                          {typeLabels[product.product_type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-[11px] text-foreground">{product.categories?.name || "-"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-foreground">
                          {product.base_price ? `NPR ${product.base_price}` : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs font-medium ${product.stock_quantity === 0 ? "text-destructive" : "text-emerald-500"}`}>
                          {product.stock_quantity === 0 ? "Out" : product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${product.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => toggleActive(product)} className="p-1.5 hover:bg-secondary rounded-md transition-colors cursor-pointer" title={product.is_active ? "Deactivate" : "Activate"}>
                            {product.is_active ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                          </button>
                          <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 hover:bg-secondary rounded-md transition-colors cursor-pointer" title="Edit">
                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                          </Link>
                          <button onClick={() => deleteProduct(product)} className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors cursor-pointer" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
