"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit2, Trash2, FolderOpen, Folder, Eye, EyeOff, ChevronRight, ChevronDown, X } from "lucide-react"
import { AdminTableSkeleton } from "@/components/skeletons"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  children?: Category[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [flatCategories, setFlatCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"parent" | "child" | "edit">("parent")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    image_url: "",
    display_order: 0,
    is_active: true,
  })

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("categories").select("*").order("display_order", { ascending: true })
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch categories" })
    } else {
      const flat = data || []
      setFlatCategories(flat)
      setCategories(buildCategoryTree(flat))
      // Expand all parents by default
      const parentIds = new Set(flat.filter(c => !c.parent_id).map(c => c.id))
      setExpandedParents(parentIds)
    }
    setIsLoading(false)
  }

  const buildCategoryTree = (flatList: Category[]): Category[] => {
    const map: Record<string, Category> = {}
    const roots: Category[] = []
    for (const item of flatList) map[item.id] = { ...item, children: [] }
    for (const item of flatList) {
      if (item.parent_id && map[item.parent_id]) map[item.parent_id].children!.push(map[item.id])
      else roots.push(map[item.id])
    }
    return roots
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({ name: "", slug: "", description: "", parent_id: "", image_url: "", display_order: 0, is_active: true })
  }

  const openAddParent = () => { resetForm(); setModalMode("parent"); setShowModal(true) }

  const openAddChild = (parentId?: string) => {
    resetForm()
    setFormData(f => ({ ...f, parent_id: parentId || "" }))
    setModalMode("child")
    setShowModal(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name, slug: cat.slug, description: cat.description || "",
      parent_id: cat.parent_id || "", image_url: cat.image_url || "",
      display_order: cat.display_order, is_active: cat.is_active,
    })
    setModalMode("edit")
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { toast({ variant: "destructive", title: "Error", description: "Name is required" }); return }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: formData.description || null,
      parent_id: formData.parent_id || null,
      image_url: formData.image_url || null,
      display_order: formData.display_order,
      is_active: formData.is_active,
    }

    if (modalMode === "parent") payload.parent_id = null

    if (editingCategory) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editingCategory.id)
      if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); return }
      toast({ variant: "default", title: "Updated", description: `"${payload.name}" updated.` })
    } else {
      const { error } = await supabase.from("categories").insert(payload)
      if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); return }
      toast({ variant: "default", title: "Created", description: `"${payload.name}" added.` })
    }
    setShowModal(false)
    resetForm()
    fetchCategories()
  }

  const handleDelete = async (cat: Category) => {
    const childCount = cat.children?.length || 0
    const msg = childCount > 0 ? `Delete "${cat.name}" and its ${childCount} sub-categories?` : `Delete "${cat.name}"?`
    if (!confirm(msg)) return
    const { error } = await supabase.from("categories").delete().eq("id", cat.id)
    if (error) { toast({ variant: "destructive", title: "Error", description: error.message }) }
    else { toast({ variant: "default", title: "Deleted", description: `"${cat.name}" removed.` }); fetchCategories() }
  }

  const toggleActive = async (cat: Category) => {
    const { error } = await supabase.from("categories").update({ is_active: !cat.is_active }).eq("id", cat.id)
    if (error) { toast({ variant: "destructive", title: "Error", description: error.message }) }
    else fetchCategories()
  }

  const toggleExpand = (id: string) => {
    const next = new Set(expandedParents)
    if (next.has(id)) next.delete(id); else next.add(id)
    setExpandedParents(next)
  }

  const parentCategories = flatCategories.filter(c => !c.parent_id)
  const filteredCategories = searchTerm
    ? categories.map(parent => ({
        ...parent,
        children: parent.children?.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())) || [],
      })).filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.children && p.children.length > 0))
    : categories

  const stats = {
    total: flatCategories.length,
    parents: parentCategories.length,
    children: flatCategories.length - parentCategories.length,
    active: flatCategories.filter(c => c.is_active).length,
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" /> Categories
          </h1>
          <p className="text-xs text-muted-foreground">{stats.total} categories | {stats.parents} parent, {stats.children} sub-categories</p>
        </div>
        <div className="flex gap-2 self-start">
          <button onClick={openAddParent} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Parent Category
          </button>
          <button onClick={() => openAddChild()} className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-foreground text-xs font-semibold rounded-lg border border-border hover:bg-secondary/80 transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Sub-Category
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total },
          { label: "Parents", value: stats.parents },
          { label: "Sub-categories", value: stats.children },
          { label: "Active", value: stats.active },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input type="text" placeholder="Search categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
      </div>

      {/* Category Tree */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <AdminTableSkeleton rows={4} cols={3} />
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="w-10 h-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No categories yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">Create a parent category to get started.</p>
            <button onClick={openAddParent} className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Parent Category
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCategories.map(parent => (
              <div key={parent.id}>
                {/* Parent Row */}
                <div className="flex items-center gap-2 px-4 py-3 hover:bg-secondary/20 transition-colors group">
                  <button onClick={() => toggleExpand(parent.id)} className="p-0.5 cursor-pointer">
                    {parent.children && parent.children.length > 0 ? (
                      expandedParents.has(parent.id) ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : <span className="w-3.5 h-3.5" />}
                  </button>
                  <FolderOpen className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-foreground">{parent.name}</span>
                  <span className="text-[10px] text-muted-foreground mr-2">{parent.children?.length || 0} sub</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1 ${parent.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                    {parent.is_active ? "Active" : "Hidden"}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openAddChild(parent.id)} className="p-1.5 hover:bg-primary/10 rounded-md transition-colors cursor-pointer" title="Add sub-category">
                      <Plus className="w-3 h-3 text-primary" />
                    </button>
                    <button onClick={() => toggleActive(parent)} className="p-1.5 hover:bg-secondary rounded-md transition-colors cursor-pointer" title={parent.is_active ? "Hide" : "Show"}>
                      {parent.is_active ? <Eye className="w-3 h-3 text-muted-foreground" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                    </button>
                    <button onClick={() => openEdit(parent)} className="p-1.5 hover:bg-secondary rounded-md transition-colors cursor-pointer" title="Edit">
                      <Edit2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(parent)} className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors cursor-pointer" title="Delete">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </div>
                {/* Children */}
                <AnimatePresence>
                  {expandedParents.has(parent.id) && parent.children && parent.children.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      {parent.children.map(child => (
                        <div key={child.id} className="flex items-center gap-2 pl-12 pr-4 py-2.5 hover:bg-secondary/20 transition-colors group border-t border-border/50">
                          <Folder className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="flex-1 text-xs font-medium text-foreground">{child.name}</span>
                          <span className="text-[10px] text-muted-foreground mr-2">{child.slug}</span>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1 ${child.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                            {child.is_active ? "Active" : "Hidden"}
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => toggleActive(child)} className="p-1 hover:bg-secondary rounded transition-colors cursor-pointer">
                              {child.is_active ? <Eye className="w-3 h-3 text-muted-foreground" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                            </button>
                            <button onClick={() => openEdit(child)} className="p-1 hover:bg-secondary rounded transition-colors cursor-pointer">
                              <Edit2 className="w-3 h-3 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDelete(child)} className="p-1 hover:bg-destructive/10 rounded transition-colors cursor-pointer">
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); resetForm() }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}
              className="bg-card border border-border rounded-xl p-5 max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground">
                  {modalMode === "parent" && "Add Parent Category"}
                  {modalMode === "child" && "Add Sub-Category"}
                  {modalMode === "edit" && `Edit "${editingCategory?.name}"`}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm() }} className="p-1 hover:bg-secondary rounded cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" placeholder="Category name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Slug</label>
                    <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" placeholder="auto-generated" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" placeholder="Optional description" />
                </div>

                {/* Parent selector - only for child mode and edit mode */}
                {(modalMode === "child" || modalMode === "edit") && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Parent Category</label>
                    <select value={formData.parent_id} onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                      <option value="">None (Root / Parent)</option>
                      {parentCategories
                        .filter(c => c.id !== editingCategory?.id)
                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Image URL</label>
                    <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Display Order</label>
                    <input type="number" value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="cat_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-3.5 h-3.5 rounded" />
                  <label htmlFor="cat_active" className="text-xs text-foreground cursor-pointer">Active (visible on storefront)</label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }}
                    className="flex-1 px-4 py-2 bg-secondary text-foreground text-xs font-medium rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                    {editingCategory ? "Save Changes" : "Create Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
