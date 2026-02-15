"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Star, Plus, Trash2, Search, Clock, Flame, Sparkles, Palette, Upload,
  ChevronDown, X, ToggleLeft, ToggleRight, ImageIcon, Paintbrush, Loader2,
} from "lucide-react"
import { AdminTableSkeleton } from "@/components/skeletons"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string; name: string; slug: string; image_url: string | null
  base_price: number | null; product_type: string; is_active: boolean
}

interface FeaturedItem {
  id: string
  section_type: "deal_of_day" | "weekly_pick"
  product_id: string
  display_order: number
  custom_label: string | null
  expires_at: string | null
  is_active: boolean
  bg_color: string | null
  bg_image: string | null
  bg_gradient: string | null
  created_at: string
  product?: Product
}

type SectionTab = "deal_of_day" | "weekly_pick"

const GRADIENT_PRESETS = [
  { name: "Sunset", value: "linear-gradient(135deg, #f97316, #ec4899)" },
  { name: "Ocean", value: "linear-gradient(135deg, #0ea5e9, #6366f1)" },
  { name: "Forest", value: "linear-gradient(135deg, #22c55e, #0d9488)" },
  { name: "Ember", value: "linear-gradient(135deg, #ef4444, #f97316)" },
  { name: "Midnight", value: "linear-gradient(135deg, #1e293b, #334155)" },
  { name: "Royal", value: "linear-gradient(135deg, #d97706, #b45309)" },
  { name: "Slate", value: "linear-gradient(135deg, #475569, #1e293b)" },
  { name: "Rose", value: "linear-gradient(135deg, #e11d48, #be123c)" },
]

export default function FeaturedPage() {
  const [items, setItems] = useState<FeaturedItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<SectionTab>("deal_of_day")
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving] = useState<string | null>(null)
  const [uploadingBg, setUploadingBg] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [featuredRes, productsRes] = await Promise.all([
      supabase.from("featured_sections").select("*").order("display_order", { ascending: true }),
      supabase.from("products").select("id, name, slug, image_url, base_price, product_type, is_active").eq("is_active", true).order("name"),
    ])
    if (featuredRes.error) toast({ variant: "error", title: "Error", description: featuredRes.error.message })
    if (productsRes.error) toast({ variant: "error", title: "Error", description: productsRes.error.message })
    const featuredData = (featuredRes.data || []) as FeaturedItem[]
    const productsData = (productsRes.data || []) as Product[]
    const enriched = featuredData.map((item) => ({ ...item, product: productsData.find((p) => p.id === item.product_id) }))
    setItems(enriched)
    setProducts(productsData)
    setLoading(false)
  }

  const filtered = items.filter((i) => i.section_type === activeTab)
  const usedProductIds = items.filter((i) => i.section_type === activeTab).map((i) => i.product_id)
  const availableProducts = products.filter(
    (p) => !usedProductIds.includes(p.id) && (searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAdd = async (productId: string) => {
    setSaving(productId)
    const maxOrder = filtered.reduce((max, i) => Math.max(max, i.display_order), -1)
    const { error } = await supabase.from("featured_sections").insert({ section_type: activeTab, product_id: productId, display_order: maxOrder + 1, is_active: true })
    if (error) toast({ variant: "error", title: "Error", description: error.message })
    else { toast({ title: "Added" }); await fetchAll() }
    setSaving(null); setShowAddModal(false); setSearchQuery("")
  }

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("featured_sections").delete().eq("id", id)
    if (error) toast({ variant: "error", title: "Error", description: error.message })
    else { toast({ title: "Removed" }); setItems((prev) => prev.filter((i) => i.id !== id)) }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    setSaving(id)
    await supabase.from("featured_sections").update({ is_active: !current }).eq("id", id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_active: !current } : i)))
    setSaving(null)
  }

  const handleUpdateField = async (id: string, field: string, value: string | null) => {
    const { error } = await supabase.from("featured_sections").update({ [field]: value || null }).eq("id", id)
    if (error) toast({ variant: "error", title: "Error", description: error.message })
    else setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value || null } : i)))
  }

  const handleMoveOrder = async (id: string, direction: "up" | "down") => {
    const idx = filtered.findIndex((i) => i.id === id)
    if ((direction === "up" && idx <= 0) || (direction === "down" && idx >= filtered.length - 1)) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    const current = filtered[idx], swap = filtered[swapIdx]
    await Promise.all([
      supabase.from("featured_sections").update({ display_order: swap.display_order }).eq("id", current.id),
      supabase.from("featured_sections").update({ display_order: current.display_order }).eq("id", swap.id),
    ])
    await fetchAll()
  }

  const handleBgImageUpload = async (itemId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please upload an image file." })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Too large", description: "Image must be under 5MB." })
      return
    }
    setUploadingBg(itemId)
    const ext = file.name.split(".").pop() || "jpg"
    const path = `featured-bg/${itemId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("product-images").upload(path, file)
    if (error) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message })
      setUploadingBg(null)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path)
    await handleUpdateField(itemId, "bg_image", publicUrl)
    // Clear gradient so image takes priority
    await handleUpdateField(itemId, "bg_gradient", null)
    toast({ title: "Background image uploaded" })
    setUploadingBg(null)
  }

  function getCardBg(item: FeaturedItem) {
    if (item.bg_gradient) return { background: item.bg_gradient }
    if (item.bg_image) return { backgroundImage: `url(${item.bg_image})`, backgroundSize: "cover", backgroundPosition: "center" }
    if (item.bg_color) return { backgroundColor: item.bg_color }
    return { backgroundColor: "#d97706" }
  }

  const tabs: { key: SectionTab; label: string; icon: typeof Flame; desc: string }[] = [
    { key: "deal_of_day", label: "Deal of the Day", icon: Flame, desc: "Hero deal with countdown timer" },
    { key: "weekly_pick", label: "Weekly Picks", icon: Sparkles, desc: "Curated products for the week" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" /> Featured Sections
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage Deal of the Day and Weekly Picks with custom backgrounds.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key; const Icon = tab.icon
          const count = items.filter((i) => i.section_type === tab.key).length
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${isActive ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "border-border bg-card hover:border-primary/30"}`}>
              <div className={`p-2 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}><Icon className="w-4 h-4" /></div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>{count}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">{tab.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Items */}
      {loading ? <AdminTableSkeleton rows={3} cols={4} /> : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/50">
          <Star className="w-8 h-8 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No products in {activeTab === "deal_of_day" ? "Deal of the Day" : "Weekly Picks"}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Click &quot;Add Product&quot; to feature products here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => {
            const isExpanded = expandedItem === item.id
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className={`rounded-xl border bg-card transition-all ${item.is_active ? "border-border" : "border-border/50 opacity-60"}`}>
                {/* Main Row */}
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  {/* Order */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => handleMoveOrder(item.id, "up")} disabled={idx === 0}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"><ChevronDown className="w-3 h-3 rotate-180" /></button>
                    <span className="text-[10px] font-bold text-muted-foreground text-center">{idx + 1}</span>
                    <button onClick={() => handleMoveOrder(item.id, "down")} disabled={idx === filtered.length - 1}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"><ChevronDown className="w-3 h-3" /></button>
                  </div>

                  {/* Live Preview Card */}
                  <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 relative" style={getCardBg(item)}>
                    {item.product?.image_url && (
                      <Image src={item.product.image_url} alt="" width={96} height={64} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" />
                    )}
                    <div className="absolute inset-0 flex items-end p-1.5">
                      <span className="text-white text-[8px] font-bold truncate drop-shadow-md leading-tight">{item.product?.name}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold text-foreground truncate">{item.product?.name || "Unknown"}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-primary font-semibold">NPR {item.product?.base_price?.toLocaleString() || "0"}</span>
                      {item.custom_label && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">{item.custom_label}</span>}
                      {item.expires_at && <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Clock className="w-2.5 h-2.5" />{new Date(item.expires_at).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isExpanded ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"}`} title="Customize appearance">
                      <Palette className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggleActive(item.id, item.is_active)} disabled={saving === item.id}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer" title={item.is_active ? "Deactivate" : "Activate"}>
                      {item.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <button onClick={() => handleRemove(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Panel -- Appearance Controls */}
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border">
                    <div className="p-4 grid sm:grid-cols-2 gap-4">
                      {/* Left: Controls */}
                      <div className="space-y-3">
                        {/* Custom Label */}
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Custom Label</label>
                          <input type="text" placeholder="e.g. Limited Time!" defaultValue={item.custom_label || ""}
                            onBlur={(e) => handleUpdateField(item.id, "custom_label", e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        </div>

                        {/* Expiry */}
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Expires At</label>
                          <input type="date" defaultValue={item.expires_at ? item.expires_at.split("T")[0] : ""}
                            onChange={(e) => handleUpdateField(item.id, "expires_at", e.target.value ? new Date(e.target.value).toISOString() : "")}
                            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        </div>

                        {/* Background Color */}
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1.5">
                            <Paintbrush className="w-3 h-3" /> Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={item.bg_color || "#d97706"}
                              onChange={(e) => handleUpdateField(item.id, "bg_color", e.target.value)}
                              className="w-8 h-8 rounded-md border border-border cursor-pointer p-0.5" />
                            <input type="text" placeholder="#d97706" value={item.bg_color || ""}
                              onChange={(e) => handleUpdateField(item.id, "bg_color", e.target.value)}
                              className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-[12px] text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/30" />
                            {item.bg_color && (
                              <button onClick={() => handleUpdateField(item.id, "bg_color", null)}
                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-3 h-3" /></button>
                            )}
                          </div>
                        </div>

                        {/* Background Image */}
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1.5">
                            <ImageIcon className="w-3 h-3" /> Background Image
                          </label>
                          {item.bg_image && (
                            <div className="relative w-full h-20 rounded-lg overflow-hidden mb-2 ring-1 ring-border">
                              <Image src={item.bg_image} alt="Background preview" fill className="object-cover" />
                              <button onClick={() => handleUpdateField(item.id, "bg_image", null)}
                                className="absolute top-1 right-1 p-1 bg-black/60 rounded-md hover:bg-black/80 transition-colors cursor-pointer">
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[11px] font-semibold transition-colors cursor-pointer ${
                              uploadingBg === item.id ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary/50 text-foreground hover:bg-secondary hover:border-primary/20"
                            }`}>
                              {uploadingBg === item.id ? (
                                <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                              ) : (
                                <><Upload className="w-3 h-3" /> Upload</>
                              )}
                              <input type="file" accept="image/*" className="sr-only" disabled={uploadingBg === item.id}
                                onChange={(e) => { if (e.target.files?.[0]) handleBgImageUpload(item.id, e.target.files[0]); e.target.value = "" }} />
                            </label>
                            <input type="text" placeholder="or paste URL..." value={item.bg_image || ""}
                              onChange={(e) => handleUpdateField(item.id, "bg_image", e.target.value)}
                              className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                          </div>
                        </div>

                        {/* Gradient Presets */}
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Gradient Presets</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {GRADIENT_PRESETS.map((g) => (
                              <button key={g.name} onClick={() => { handleUpdateField(item.id, "bg_gradient", g.value); handleUpdateField(item.id, "bg_color", null); handleUpdateField(item.id, "bg_image", null) }}
                                className={`h-8 rounded-lg border-2 transition-all cursor-pointer ${item.bg_gradient === g.value ? "border-primary shadow-sm shadow-primary/20" : "border-transparent hover:border-border"}`}
                                style={{ background: g.value }} title={g.name} />
                            ))}
                          </div>
                          {item.bg_gradient && (
                            <div className="flex items-center gap-2 mt-2">
                              <input type="text" value={item.bg_gradient} onChange={(e) => handleUpdateField(item.id, "bg_gradient", e.target.value)}
                                className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-[11px] text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/30" />
                              <button onClick={() => handleUpdateField(item.id, "bg_gradient", null)}
                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-3 h-3" /></button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Live Preview */}
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Live Preview</label>
                        <div className="rounded-xl overflow-hidden relative h-36 sm:h-44" style={getCardBg(item)}>
                          {item.product?.image_url && (
                            <Image src={item.product.image_url} alt="" width={320} height={180} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            {item.custom_label && <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-white text-[10px] font-bold mb-1.5">{item.custom_label}</span>}
                            <h4 className="text-white font-bold text-base leading-tight drop-shadow-md">{item.product?.name || "Product Name"}</h4>
                            <p className="text-white/80 text-[12px] mt-0.5">NPR {item.product?.base_price?.toLocaleString() || "0"}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">This is how the card will appear on the homepage</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setSearchQuery("") }} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative w-full sm:max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-sm font-bold text-foreground">Add Product</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">to {activeTab === "deal_of_day" ? "Deal of the Day" : "Weekly Picks"}</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setSearchQuery("") }}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {availableProducts.length === 0 ? (
                <div className="text-center py-10"><p className="text-sm text-muted-foreground">No products available</p></div>
              ) : availableProducts.map((product) => (
                <button key={product.id} onClick={() => handleAdd(product.id)} disabled={saving === product.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/80 transition-colors cursor-pointer text-left disabled:opacity-50">
                  <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                    {product.image_url ? <Image src={product.image_url} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Star className="w-3.5 h-3.5" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-foreground truncate block">{product.name}</span>
                    <span className="text-[11px] text-muted-foreground">NPR {product.base_price?.toLocaleString() || "0"}</span>
                  </div>
                  {saving === product.id ? <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Plus className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
