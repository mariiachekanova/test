"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { uploadProductImage, deleteProductImage } from "@/lib/upload-image"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import {
  Save, X, Plus, Trash2, Upload, Loader2,
  Tag, HelpCircle, CreditCard, Gamepad2, Tv, ChevronDown,
} from "lucide-react"
import { ProductFormSkeleton } from "@/components/skeletons"

type ProductType = "gift_card" | "game" | "subscription"

// Matches product_faqs: question, answer, display_order
interface FAQ { question: string; answer: string; display_order: number }

// Matches subscription_plans: plan_name, description, is_active
interface SubPlan {
  id?: string
  plan_name: string
  description: string
  is_active: boolean
  // Nested durations from subscription_durations
  durations: SubDuration[]
}

// Matches subscription_durations: duration_name, duration_value, price, original_price, discount_percentage, is_active
interface SubDuration {
  duration_name: string
  duration_value: number
  price: number
  original_price: number
  discount_percentage: number
  is_active: boolean
}

// Matches gift_card_denominations: amount, original_price, is_active
interface Denomination { amount: number; original_price: number; is_active: boolean }

// Matches game_details: platform[], genre[], developer, publisher, release_date, system_requirements
interface GameMeta { platform: string[]; genre: string[]; developer: string; publisher: string; release_date: string; system_requirements: Record<string, string> }

interface ProductFormProps { productId?: string }

export default function AdminProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)

  // Basic fields matching products table
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [shortDesc, setShortDesc] = useState("")
  const [longDesc, setLongDesc] = useState("")
  const [productType, setProductType] = useState<ProductType>("gift_card")
  const [basePrice, setBasePrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountPct, setDiscountPct] = useState("0")
  const [imageUrl, setImageUrl] = useState("")
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [stockQty, setStockQty] = useState("0")
  const [sku, setSku] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDesc, setMetaDesc] = useState("")
  const [metaKeywords, setMetaKeywords] = useState<string[]>([])
  const [kwInput, setKwInput] = useState("")

  // Category
  const [categories, setCategories] = useState<{ id: string; name: string; parent_name?: string }[]>([])
  const [categoryId, setCategoryId] = useState("")

  // Tags
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState("")

  // FAQs (product_faqs table)
  const [faqs, setFaqs] = useState<FAQ[]>([])

  // Subscription plans + durations
  const [plans, setPlans] = useState<SubPlan[]>([])

  // Gift card denominations
  const [denoms, setDenoms] = useState<Denomination[]>([])

  // Game metadata
  const [gameMeta, setGameMeta] = useState<GameMeta>({ platform: [], genre: [], developer: "", publisher: "", release_date: "", system_requirements: {} })
  const [platInput, setPlatInput] = useState("")
  const [genreInput, setGenreInput] = useState("")

  // Load categories + tags
  useEffect(() => {
    async function load() {
      const [catRes, tagRes] = await Promise.all([
        supabase.from("categories").select("id, name, parent_id").eq("is_active", true).order("display_order"),
        supabase.from("tags").select("id, name").order("name"),
      ])
      if (catRes.data) {
        const parents = catRes.data.filter(c => !c.parent_id)
        setCategories(catRes.data.map(c => ({
          id: c.id, name: c.name,
          parent_name: parents.find(p => p.id === c.parent_id)?.name,
        })))
      }
      if (tagRes.data) setAllTags(tagRes.data)
    }
    load()
  }, [])

  // Load product for editing
  useEffect(() => {
    if (!productId) return
    async function fetchProduct() {
      setLoading(true)
      const { data: p } = await supabase.from("products").select("*").eq("id", productId).single()
      if (p) {
        setName(p.name || "")
        setSlug(p.slug || "")
        setShortDesc(p.short_description || "")
        setLongDesc(p.long_description || "")
        setProductType(p.product_type || "gift_card")
        setBasePrice(p.base_price?.toString() || "")
        setOriginalPrice(p.original_price?.toString() || "")
        setDiscountPct(p.discount_percentage?.toString() || "0")
        setImageUrl(p.image_url || "")
        setGalleryImages(p.gallery_images || [])
        setIsActive(p.is_active ?? true)
        setIsFeatured(p.is_featured ?? false)
        setStockQty(p.stock_quantity?.toString() || "0")
        setSku(p.sku || "")
        setMetaTitle(p.meta_title || "")
        setMetaDesc(p.meta_description || "")
        setMetaKeywords(p.meta_keywords || [])
        setCategoryId(p.category_id || "")

        // Load related data
        const [tagRes, faqRes, planRes, denomRes, gameRes] = await Promise.all([
          supabase.from("product_tags").select("tag_id").eq("product_id", productId),
          supabase.from("product_faqs").select("*").eq("product_id", productId).order("display_order"),
          supabase.from("subscription_plans").select("*").eq("product_id", productId),
          supabase.from("gift_card_denominations").select("*").eq("product_id", productId),
          supabase.from("game_details").select("*").eq("product_id", productId).single(),
        ])
        if (tagRes.data) setSelectedTagIds(tagRes.data.map(t => t.tag_id))
        if (faqRes.data) setFaqs(faqRes.data.map(f => ({ question: f.question, answer: f.answer, display_order: f.display_order ?? 0 })))
        if (denomRes.data) setDenoms(denomRes.data.map(d => ({ amount: Number(d.amount), original_price: Number(d.original_price) || 0, is_active: d.is_active ?? true })))
        if (gameRes.data) setGameMeta({ platform: gameRes.data.platform || [], genre: gameRes.data.genre || [], developer: gameRes.data.developer || "", publisher: gameRes.data.publisher || "", release_date: gameRes.data.release_date || "", system_requirements: gameRes.data.system_requirements || {} })

        // Load plans with their durations
        if (planRes.data && planRes.data.length > 0) {
          const plansWithDurations: SubPlan[] = []
          for (const pl of planRes.data) {
            const { data: durs } = await supabase.from("subscription_durations").select("*").eq("plan_id", pl.id)
            plansWithDurations.push({
              id: pl.id,
              plan_name: pl.plan_name || "",
              description: pl.description || "",
              is_active: pl.is_active ?? true,
              durations: (durs || []).map(d => ({
                duration_name: d.duration_name || "",
                duration_value: d.duration_value ?? 0,
                price: Number(d.price) || 0,
                original_price: Number(d.original_price) || 0,
                discount_percentage: d.discount_percentage ?? 0,
                is_active: d.is_active ?? true,
              })),
            })
          }
          setPlans(plansWithDurations)
        }
      }
      setLoading(false)
    }
    fetchProduct()
  }, [productId])

  // Auto slug
  useEffect(() => {
    if (!productId) setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
  }, [name, productId])

  // Image upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgUploading(true)
    try {
      if (imageUrl) await deleteProductImage(imageUrl).catch(() => {})
      const url = await uploadProductImage(file)
      setImageUrl(url)
      toast({ variant: "default", title: "Image uploaded" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message })
    }
    setImgUploading(false)
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setImgUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file)
        urls.push(url)
      }
      setGalleryImages([...galleryImages, ...urls])
      toast({ variant: "default", title: `${urls.length} image(s) uploaded` })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message })
    }
    setImgUploading(false)
  }

  // Create new tag
  async function createTag() {
    const n = newTagName.trim()
    if (!n) return
    const tagSlug = n.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const { data, error } = await supabase.from("tags").insert({ name: n, slug: tagSlug }).select("id, name").single()
    if (data) {
      setAllTags([...allTags, data])
      setSelectedTagIds([...selectedTagIds, data.id])
      setNewTagName("")
    }
    if (error) toast({ variant: "destructive", title: "Error", description: error.message })
  }

  // Save
  async function handleSave() {
    if (!name.trim()) { toast({ variant: "destructive", title: "Name is required" }); return }
    setSaving(true)

    const payload = {
      name, slug, short_description: shortDesc, long_description: longDesc,
      product_type: productType,
      base_price: parseFloat(basePrice) || 0,
      original_price: parseFloat(originalPrice) || 0,
      discount_percentage: parseInt(discountPct) || 0,
      image_url: imageUrl || null,
      gallery_images: galleryImages.length ? galleryImages : null,
      is_active: isActive, is_featured: isFeatured,
      stock_quantity: parseInt(stockQty) || 0, sku: sku || null,
      meta_title: metaTitle || null, meta_description: metaDesc || null,
      meta_keywords: metaKeywords.length ? metaKeywords : null,
      category_id: categoryId || null,
    }

    let pid = productId
    let error
    if (productId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", productId))
    } else {
      const res = await supabase.from("products").insert(payload).select("id").single()
      error = res.error
      pid = res.data?.id
    }
    if (error || !pid) { toast({ variant: "destructive", title: "Save failed", description: error?.message }); setSaving(false); return }

    // Save related data - clear and re-insert
    // First delete subscription_durations for existing plans
    if (productId) {
      const { data: existingPlans } = await supabase.from("subscription_plans").select("id").eq("product_id", pid)
      if (existingPlans?.length) {
        for (const ep of existingPlans) {
          await supabase.from("subscription_durations").delete().eq("plan_id", ep.id)
        }
      }
    }

    await Promise.all([
      supabase.from("product_tags").delete().eq("product_id", pid),
      supabase.from("product_faqs").delete().eq("product_id", pid),
      supabase.from("subscription_plans").delete().eq("product_id", pid),
      supabase.from("gift_card_denominations").delete().eq("product_id", pid),
      supabase.from("game_details").delete().eq("product_id", pid),
    ])

    const promises: Promise<any>[] = []

    // Tags (product_tags junction)
    if (selectedTagIds.length) {
      promises.push(supabase.from("product_tags").insert(selectedTagIds.map(tid => ({ product_id: pid, tag_id: tid }))))
    }

    // FAQs (product_faqs: question, answer, display_order)
    if (faqs.length) {
      promises.push(supabase.from("product_faqs").insert(faqs.map((f, i) => ({
        product_id: pid,
        question: f.question,
        answer: f.answer,
        display_order: i,
      }))))
    }

    // Gift card denominations (amount, is_active)
    if (productType === "gift_card" && denoms.length) {
      promises.push(supabase.from("gift_card_denominations").insert(denoms.map(d => ({
        product_id: pid,
        amount: d.amount,
        original_price: d.original_price || 0,
        is_active: d.is_active,
      }))))
    }

    // Game metadata
    if (productType === "game") {
      promises.push(supabase.from("game_details").insert({
        product_id: pid,
        platform: gameMeta.platform,
        genre: gameMeta.genre,
        developer: gameMeta.developer || null,
        publisher: gameMeta.publisher || null,
        release_date: gameMeta.release_date || null,
        system_requirements: Object.keys(gameMeta.system_requirements).length ? gameMeta.system_requirements : null,
      }))
    }

    await Promise.all(promises)

    // Subscription plans + durations (must be sequential for plan IDs)
    if (productType === "subscription" && plans.length) {
      for (const plan of plans) {
        const { data: newPlan } = await supabase.from("subscription_plans").insert({
          product_id: pid,
          plan_name: plan.plan_name,
          description: plan.description || null,
          is_active: plan.is_active,
        }).select("id").single()

        if (newPlan && plan.durations.length) {
          await supabase.from("subscription_durations").insert(plan.durations.map(d => ({
            plan_id: newPlan.id,
            duration_name: d.duration_name,
            duration_value: d.duration_value,
            price: d.price,
            original_price: d.original_price || 0,
            discount_percentage: d.discount_percentage,
            is_active: d.is_active,
          })))
        }
      }
    }

    setSaving(false)
    toast({ variant: "default", title: productId ? "Product updated" : "Product created" })
    router.push("/admin/products")
  }

  if (loading) return <ProductFormSkeleton />

  const typeOpts: { key: ProductType; label: string; icon: typeof CreditCard }[] = [
    { key: "gift_card", label: "Gift Card", icon: CreditCard },
    { key: "game", label: "Game", icon: Gamepad2 },
    { key: "subscription", label: "Subscription", icon: Tv },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-bold text-foreground">{productId ? "Edit Product" : "Add Product"}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/admin/products")} className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer font-semibold">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Info */}
          <section className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-muted-foreground mb-1 block">Product Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Netflix Premium" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Slug</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">SKU</label>
                <input value={sku} onChange={e => setSku(e.target.value)} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="NF-PREM-001" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Base Price (NPR)</label>
                <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="499" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Original Price (NPR) <span className="text-muted-foreground/60">strikethrough</span></label>
                <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="999" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Discount %</label>
                <input type="number" min="0" max="100" value={discountPct} onChange={e => setDiscountPct(e.target.value)} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Stock Quantity</label>
                <input type="number" value={stockQty} onChange={e => setStockQty(e.target.value)} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Short Description</label>
              <textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows={2} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Brief product description..." />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Long Description (HTML for SEO)</label>
              <textarea value={longDesc} onChange={e => setLongDesc(e.target.value)} rows={6} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-y" placeholder={"<h2>About this product</h2>\n<p>Detailed description here...</p>"} />
              <p className="text-[10px] text-muted-foreground mt-1">Supports HTML tags for rich content and SEO optimization.</p>
            </div>
          </section>

          {/* Product Type */}
          <section className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Product Type</h2>
            <div className="grid grid-cols-3 gap-2">
              {typeOpts.map(t => (
                <button key={t.key} onClick={() => setProductType(t.key)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${productType === t.key ? "bg-primary/10 border-primary/40 text-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                  <t.icon className="w-4 h-4" />{t.label}
                </button>
              ))}
            </div>

            {/* Gift Card Denominations */}
            {productType === "gift_card" && (
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-[11px] font-medium text-foreground block">Denominations</label>
                {denoms.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1">
                      <input type="number" value={d.amount} onChange={e => { const a = [...denoms]; a[i] = { ...a[i], amount: parseFloat(e.target.value) || 0 }; setDenoms(a) }} className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" placeholder="Price (NPR)" />
                    </div>
                    <div className="flex-1">
                      <input type="number" value={d.original_price || ""} onChange={e => { const a = [...denoms]; a[i] = { ...a[i], original_price: parseFloat(e.target.value) || 0 }; setDenoms(a) }} className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" placeholder="Original price (strikethrough)" />
                    </div>
                    <label className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                      <input type="checkbox" checked={d.is_active} onChange={e => { const a = [...denoms]; a[i] = { ...a[i], is_active: e.target.checked }; setDenoms(a) }} className="rounded" />
                      Active
                    </label>
                    <button onClick={() => setDenoms(denoms.filter((_, j) => j !== i))} className="p-1 text-destructive hover:bg-destructive/10 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => setDenoms([...denoms, { amount: 0, original_price: 0, is_active: true }])} className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"><Plus className="w-3 h-3" />Add denomination</button>
              </div>
            )}

            {/* Game Metadata */}
            {productType === "game" && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div>
                  <label className="text-[11px] font-medium text-foreground mb-1 block">Platforms</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {gameMeta.platform.map((p, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                        {p}<button onClick={() => setGameMeta({ ...gameMeta, platform: gameMeta.platform.filter((_, j) => j !== i) })} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={platInput} onChange={e => setPlatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = platInput.trim(); if (v && !gameMeta.platform.includes(v)) { setGameMeta({ ...gameMeta, platform: [...gameMeta.platform, v] }); setPlatInput("") } } }} className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. PS5, Xbox, PC" />
                    <button onClick={() => { const v = platInput.trim(); if (v && !gameMeta.platform.includes(v)) { setGameMeta({ ...gameMeta, platform: [...gameMeta.platform, v] }); setPlatInput("") } }} className="px-2 py-1.5 bg-primary/10 text-primary text-xs rounded-lg hover:bg-primary/20 cursor-pointer"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-foreground mb-1 block">Genres</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {gameMeta.genre.map((g, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                        {g}<button onClick={() => setGameMeta({ ...gameMeta, genre: gameMeta.genre.filter((_, j) => j !== i) })} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={genreInput} onChange={e => setGenreInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = genreInput.trim(); if (v && !gameMeta.genre.includes(v)) { setGameMeta({ ...gameMeta, genre: [...gameMeta.genre, v] }); setGenreInput("") } } }} className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Action, RPG" />
                    <button onClick={() => { const v = genreInput.trim(); if (v && !gameMeta.genre.includes(v)) { setGameMeta({ ...gameMeta, genre: [...gameMeta.genre, v] }); setGenreInput("") } }} className="px-2 py-1.5 bg-primary/10 text-primary text-xs rounded-lg hover:bg-primary/20 cursor-pointer"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">Developer</label>
                    <input value={gameMeta.developer} onChange={e => setGameMeta({ ...gameMeta, developer: e.target.value })} className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">Publisher</label>
                    <input value={gameMeta.publisher} onChange={e => setGameMeta({ ...gameMeta, publisher: e.target.value })} className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] text-muted-foreground mb-1 block">Release Date</label>
                    <input type="date" value={gameMeta.release_date} onChange={e => setGameMeta({ ...gameMeta, release_date: e.target.value })} className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Plans with Durations */}
            {productType === "subscription" && (
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="text-[11px] font-medium text-foreground block">Subscription Plans</label>
                {plans.map((pl, pi) => (
                  <div key={pi} className="bg-secondary/50 border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input value={pl.plan_name} onChange={e => { const a = [...plans]; a[pi] = { ...a[pi], plan_name: e.target.value }; setPlans(a) }} className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-primary/50" placeholder="Plan name (e.g. Basic, Premium)" />
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                        <input type="checkbox" checked={pl.is_active} onChange={e => { const a = [...plans]; a[pi] = { ...a[pi], is_active: e.target.checked }; setPlans(a) }} className="rounded" />
                        Active
                      </label>
                      <button onClick={() => setPlans(plans.filter((_, j) => j !== pi))} className="p-1 text-destructive hover:bg-destructive/10 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <input value={pl.description} onChange={e => { const a = [...plans]; a[pi] = { ...a[pi], description: e.target.value }; setPlans(a) }} className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" placeholder="Plan description" />

                    {/* Durations for this plan */}
                    <div className="pl-3 border-l-2 border-primary/20 space-y-2 mt-2">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Durations</label>
                      {pl.durations.map((dur, di) => (
                        <div key={di} className="grid grid-cols-6 gap-1.5 items-end">
                          <div>
                            <label className="text-[9px] text-muted-foreground">Name</label>
                            <input value={dur.duration_name} onChange={e => { const a = [...plans]; const d = [...a[pi].durations]; d[di] = { ...d[di], duration_name: e.target.value }; a[pi] = { ...a[pi], durations: d }; setPlans(a) }} className="w-full px-1.5 py-1 bg-secondary border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary/50" placeholder="1 Month" />
                          </div>
                          <div>
                            <label className="text-[9px] text-muted-foreground">Days</label>
                            <input type="number" value={dur.duration_value} onChange={e => { const a = [...plans]; const d = [...a[pi].durations]; d[di] = { ...d[di], duration_value: parseInt(e.target.value) || 0 }; a[pi] = { ...a[pi], durations: d }; setPlans(a) }} className="w-full px-1.5 py-1 bg-secondary border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary/50" placeholder="30" />
                          </div>
                          <div>
                            <label className="text-[9px] text-muted-foreground">Price</label>
                            <input type="number" value={dur.price} onChange={e => { const a = [...plans]; const d = [...a[pi].durations]; d[di] = { ...d[di], price: parseFloat(e.target.value) || 0 }; a[pi] = { ...a[pi], durations: d }; setPlans(a) }} className="w-full px-1.5 py-1 bg-secondary border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary/50" placeholder="499" />
                          </div>
                          <div>
                            <label className="text-[9px] text-muted-foreground">Orig. Price</label>
                            <input type="number" value={dur.original_price || ""} onChange={e => { const a = [...plans]; const d = [...a[pi].durations]; d[di] = { ...d[di], original_price: parseFloat(e.target.value) || 0 }; a[pi] = { ...a[pi], durations: d }; setPlans(a) }} className="w-full px-1.5 py-1 bg-secondary border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary/50" placeholder="999" />
                          </div>
                          <div>
                            <label className="text-[9px] text-muted-foreground">Disc %</label>
                            <input type="number" value={dur.discount_percentage} onChange={e => { const a = [...plans]; const d = [...a[pi].durations]; d[di] = { ...d[di], discount_percentage: parseInt(e.target.value) || 0 }; a[pi] = { ...a[pi], durations: d }; setPlans(a) }} className="w-full px-1.5 py-1 bg-secondary border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary/50" placeholder="0" />
                          </div>
                          <button onClick={() => { const a = [...plans]; a[pi] = { ...a[pi], durations: a[pi].durations.filter((_, j) => j !== di) }; setPlans(a) }} className="p-1 text-destructive hover:bg-destructive/10 rounded cursor-pointer self-end mb-0.5"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <button onClick={() => { const a = [...plans]; a[pi] = { ...a[pi], durations: [...a[pi].durations, { duration_name: "", duration_value: 30, price: 0, original_price: 0, discount_percentage: 0, is_active: true }] }; setPlans(a) }} className="flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer"><Plus className="w-2.5 h-2.5" />Add duration</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setPlans([...plans, { plan_name: "", description: "", is_active: true, durations: [] }])} className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"><Plus className="w-3 h-3" />Add plan</button>
              </div>
            )}
          </section>

          {/* FAQs */}
          <section className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-muted-foreground" />FAQs</h2>
            {faqs.map((faq, i) => (
              <div key={i} className="bg-secondary/50 border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input value={faq.question} onChange={e => { const a = [...faqs]; a[i] = { ...a[i], question: e.target.value }; setFaqs(a) }} className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" placeholder="Question" />
                  <button onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <textarea value={faq.answer} onChange={e => { const a = [...faqs]; a[i] = { ...a[i], answer: e.target.value }; setFaqs(a) }} rows={2} className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Answer (HTML supported)" />
              </div>
            ))}
            <button onClick={() => setFaqs([...faqs, { question: "", answer: "", display_order: faqs.length }])} className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"><Plus className="w-3 h-3" />Add FAQ</button>
          </section>

          {/* SEO */}
          <section className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">SEO Settings</h2>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Meta Title</label>
              <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Custom page title..." />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Meta Description</label>
              <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={2} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="SEO description..." />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Meta Keywords</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {metaKeywords.map((kw, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-secondary text-foreground text-[10px] rounded-full border border-border">
                    {kw}<button onClick={() => setMetaKeywords(metaKeywords.filter((_, j) => j !== i))} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = kwInput.trim(); if (v) { setMetaKeywords([...metaKeywords, v]); setKwInput("") } } }} className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" placeholder="Add keyword..." />
                <button onClick={() => { const v = kwInput.trim(); if (v) { setMetaKeywords([...metaKeywords, v]); setKwInput("") } }} className="px-2.5 py-1.5 bg-secondary text-foreground text-xs rounded-lg hover:bg-secondary/80 border border-border cursor-pointer"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          </section>
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-4">
          {/* Product Image */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Product Image</h2>
            <div onClick={() => fileInputRef.current?.click()} className="relative border-2 border-dashed border-border rounded-lg aspect-square flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors cursor-pointer overflow-hidden group">
              {imageUrl ? (
                <>
                  <img src={imageUrl || "/placeholder.svg"} alt="Product" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[11px] text-white font-medium">Change Image</span>
                  </div>
                </>
              ) : imgUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Click to upload</span>
                  <span className="text-[9px] text-muted-foreground/60">JPG, PNG, WebP (max 5MB)</span>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageUpload} />
            {imageUrl && <button onClick={async () => { await deleteProductImage(imageUrl).catch(() => {}); setImageUrl("") }} className="w-full text-[11px] text-destructive hover:underline cursor-pointer">Remove image</button>}
          </div>

          {/* Gallery */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Gallery</h2>
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  <button onClick={async () => { await deleteProductImage(url).catch(() => {}); setGalleryImages(galleryImages.filter((_, j) => j !== i)) }} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={() => galleryInputRef.current?.click()} className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary/40 transition-colors cursor-pointer">
                <Plus className="w-4 h-4 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Add</span>
              </button>
            </div>
            <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={handleGalleryUpload} />
          </div>

          {/* Status */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Visibility</h2>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-foreground">Active</span>
              <div className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${isActive ? "bg-primary" : "bg-secondary"}`} onClick={() => setIsActive(!isActive)}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? "left-[18px]" : "left-0.5"}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-foreground">Featured</span>
              <div className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${isFeatured ? "bg-primary" : "bg-secondary"}`} onClick={() => setIsFeatured(!isFeatured)}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isFeatured ? "left-[18px]" : "left-0.5"}`} />
              </div>
            </label>
          </div>

          {/* Category */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Category</h2>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50 cursor-pointer">
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.parent_name ? `${c.parent_name} > ${c.name}` : c.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-muted-foreground" />Tags</h2>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(t => (
                <button key={t.id} onClick={() => setSelectedTagIds(prev => prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id])}
                  className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors cursor-pointer ${selectedTagIds.includes(t.id) ? "bg-primary/10 border-primary/40 text-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                  {t.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newTagName} onChange={e => setNewTagName(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), createTag())} className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/50" placeholder="New tag..." />
              <button onClick={createTag} className="px-2.5 py-1.5 bg-primary/10 text-primary text-xs rounded-lg hover:bg-primary/20 cursor-pointer"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
