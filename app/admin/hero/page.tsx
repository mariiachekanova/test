"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ImageIcon, Plus, Trash2, GripVertical, Eye, EyeOff, Save, X,
  Upload, Link2, Type, FileText, DollarSign, Tag, ChevronUp, ChevronDown,
} from "lucide-react"
import { AdminTableSkeleton } from "@/components/skeletons"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface HeroSlide {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price: number | null
  original_price: number | null
  link_url: string
  badge_text: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

const emptySlide: Omit<HeroSlide, "id" | "created_at"> = {
  title: "",
  description: "",
  image_url: null,
  price: null,
  original_price: null,
  link_url: "/store",
  badge_text: "Best Deals in Nepal",
  display_order: 0,
  is_active: true,
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [form, setForm] = useState(emptySlide)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => { fetchSlides() }, [])

  const fetchSlides = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("display_order", { ascending: true })
    if (error) toast({ variant: "error", title: "Error", description: error.message })
    setSlides((data || []) as HeroSlide[])
    setLoading(false)
  }

  const openAdd = () => {
    setEditingSlide(null)
    setForm({ ...emptySlide, display_order: slides.length })
    setShowForm(true)
  }

  const openEdit = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setForm({
      title: slide.title,
      description: slide.description,
      image_url: slide.image_url,
      price: slide.price,
      original_price: slide.original_price,
      link_url: slide.link_url,
      badge_text: slide.badge_text,
      display_order: slide.display_order,
      is_active: slide.is_active,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingSlide(null)
    setForm(emptySlide)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split(".").pop()
    const path = `hero/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("product-images").upload(path, file)
    if (error) {
      toast({ variant: "error", title: "Upload failed", description: error.message })
      setUploading(false)
      return
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path)
    setForm((p) => ({ ...p, image_url: urlData.publicUrl }))
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ variant: "error", title: "Title is required" })
      return
    }
    setSaving(true)

    if (editingSlide) {
      const { error } = await supabase
        .from("hero_slides")
        .update({
          title: form.title,
          description: form.description || null,
          image_url: form.image_url,
          price: form.price,
          original_price: form.original_price,
          link_url: form.link_url,
          badge_text: form.badge_text || null,
          display_order: form.display_order,
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingSlide.id)
      if (error) {
        toast({ variant: "error", title: "Update failed", description: error.message })
      } else {
        toast({ title: "Slide updated" })
        closeForm()
        fetchSlides()
      }
    } else {
      const { error } = await supabase.from("hero_slides").insert({
        title: form.title,
        description: form.description || null,
        image_url: form.image_url,
        price: form.price,
        original_price: form.original_price,
        link_url: form.link_url,
        badge_text: form.badge_text || null,
        display_order: form.display_order,
        is_active: form.is_active,
      })
      if (error) {
        toast({ variant: "error", title: "Create failed", description: error.message })
      } else {
        toast({ title: "Slide added" })
        closeForm()
        fetchSlides()
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    const { error } = await supabase.from("hero_slides").delete().eq("id", id)
    if (error) {
      toast({ variant: "error", title: "Delete failed", description: error.message })
    } else {
      toast({ title: "Slide deleted" })
      fetchSlides()
    }
    setActionLoading(null)
  }

  const toggleActive = async (slide: HeroSlide) => {
    setActionLoading(slide.id)
    const { error } = await supabase
      .from("hero_slides")
      .update({ is_active: !slide.is_active, updated_at: new Date().toISOString() })
      .eq("id", slide.id)
    if (error) {
      toast({ variant: "error", title: "Toggle failed", description: error.message })
    } else {
      setSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, is_active: !s.is_active } : s))
    }
    setActionLoading(null)
  }

  const moveSlide = async (slide: HeroSlide, direction: "up" | "down") => {
    const idx = slides.findIndex((s) => s.id === slide.id)
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= slides.length) return
    setActionLoading(slide.id)
    const other = slides[swapIdx]
    await Promise.all([
      supabase.from("hero_slides").update({ display_order: other.display_order }).eq("id", slide.id),
      supabase.from("hero_slides").update({ display_order: slide.display_order }).eq("id", other.id),
    ])
    fetchSlides()
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Hero Slides
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the homepage hero carousel. {slides.length} slide{slides.length !== 1 ? "s" : ""} configured.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground text-[12px] font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Slide
        </button>
      </div>

      {/* Slides List */}
      {loading ? (
        <AdminTableSkeleton rows={3} cols={4} />
      ) : slides.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No hero slides yet. Add your first slide to get started.</p>
          <button onClick={openAdd} className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-[12px] font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Add First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`border rounded-xl overflow-hidden transition-all ${slide.is_active ? "border-border bg-card" : "border-border/50 bg-card/50 opacity-60"}`}
            >
              <div className="flex items-stretch">
                {/* Image Preview */}
                <div className="relative w-24 sm:w-36 shrink-0 bg-secondary/30">
                  {slide.image_url ? (
                    <Image src={slide.image_url} alt={slide.title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Order badge */}
                  <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-background/80 backdrop-blur text-[10px] font-bold text-foreground flex items-center justify-center border border-border">
                    {idx + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-3 sm:p-4 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{slide.title}</h3>
                      {slide.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{slide.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {slide.badge_text && (
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-semibold rounded">
                            {slide.badge_text}
                          </span>
                        )}
                        {slide.price != null && (
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-semibold rounded">
                            NPR {slide.price.toLocaleString()}
                          </span>
                        )}
                        {slide.original_price != null && slide.price != null && slide.original_price > slide.price && (
                          <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 text-[9px] font-semibold rounded">
                            {Math.round(((slide.original_price - slide.price) / slide.original_price) * 100)}% OFF
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground text-[9px] font-medium rounded truncate max-w-[120px]">
                          {slide.link_url}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveSlide(slide, "up")} disabled={idx === 0 || !!actionLoading}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveSlide(slide, "down")} disabled={idx === slides.length - 1 || !!actionLoading}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleActive(slide)} disabled={!!actionLoading}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${slide.is_active ? "text-emerald-400 hover:bg-emerald-500/10" : "text-muted-foreground hover:bg-secondary"}`}>
                        {slide.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => openEdit(slide)}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <GripVertical className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(slide.id)} disabled={!!actionLoading}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeForm}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Form Header */}
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-sm font-bold text-foreground">
                {editingSlide ? "Edit Slide" : "Add New Slide"}
              </h2>
              <button onClick={closeForm} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Upload className="w-3 h-3" /> Slide Image
                </label>
                <div
                  className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 transition-colors aspect-[2/1] bg-secondary/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.image_url ? (
                    <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                      <Upload className="w-6 h-6 text-muted-foreground/40" />
                      <span className="text-[11px] text-muted-foreground">
                        {uploading ? "Uploading..." : "Click to upload image"}
                      </span>
                    </div>
                  )}
                  {form.image_url && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, image_url: null })) }}
                      className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {/* Or paste URL */}
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.image_url || ""}
                      onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value || null }))}
                      placeholder="Or paste image URL..."
                      className="flex-1 px-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <Type className="w-3 h-3" /> Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Netflix Subscription"
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <FileText className="w-3 h-3" /> Description
                </label>
                <textarea
                  rows={2}
                  value={form.description || ""}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value || null }))}
                  placeholder="Short description for the slide..."
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <DollarSign className="w-3 h-3" /> Price (NPR)
                  </label>
                  <input
                    type="number"
                    value={form.price ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <DollarSign className="w-3 h-3" /> Original Price
                  </label>
                  <input
                    type="number"
                    value={form.original_price ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, original_price: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Link URL & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <Link2 className="w-3 h-3" /> Link URL
                  </label>
                  <input
                    type="text"
                    value={form.link_url}
                    onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))}
                    placeholder="/store or /product/slug"
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <Tag className="w-3 h-3" /> Badge Text
                  </label>
                  <input
                    type="text"
                    value={form.badge_text || ""}
                    onChange={(e) => setForm((p) => ({ ...p, badge_text: e.target.value || null }))}
                    placeholder="e.g. Best Deals in Nepal"
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-[12px] font-medium text-foreground">Slide is active</span>
                <button
                  onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.is_active ? "bg-primary" : "bg-border"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "left-5.5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border sticky bottom-0 bg-card">
              <button onClick={closeForm} className="px-4 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-[12px] font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {editingSlide ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
