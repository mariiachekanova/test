"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  FileText, Plus, Search, Edit, Trash2, Eye, EyeOff, Save, X,
  Upload, Link2, Image as ImageIcon, Loader2, ExternalLink, Package,
} from "lucide-react"
import { AdminTableSkeleton } from "@/components/skeletons"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  image_url: string | null
  status: string             // "published" | "draft"
  category_tag: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  views: number
  created_at: string
  updated_at: string
}

interface LinkedProduct {
  id: string
  name: string
  image_url: string | null
  slug: string
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image_url: null as string | null,
  status: "draft",
  category_tag: "",
  meta_title: "",
  meta_description: "",
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  // Product linking
  const [linkedProducts, setLinkedProducts] = useState<LinkedProduct[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [productResults, setProductResults] = useState<LinkedProduct[]>([])
  const [searchingProducts, setSearchingProducts] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const fetchLinkedProducts = async (postId: string) => {
    const { data: links } = await supabase
      .from("blog_post_products")
      .select("product_id")
      .eq("blog_post_id", postId)
    if (links && links.length > 0) {
      const ids = links.map((l: { product_id: string }) => l.product_id)
      const { data: products } = await supabase
        .from("products")
        .select("id, name, image_url, slug")
        .in("id", ids)
      setLinkedProducts((products || []) as LinkedProduct[])
    } else {
      setLinkedProducts([])
    }
  }

  const searchProducts = async (q: string) => {
    if (q.length < 2) { setProductResults([]); return }
    setSearchingProducts(true)
    const { data } = await supabase
      .from("products")
      .select("id, name, image_url, slug")
      .ilike("name", `%${q}%`)
      .eq("is_active", true)
      .limit(8)
    const existing = linkedProducts.map(p => p.id)
    setProductResults(((data || []) as LinkedProduct[]).filter(p => !existing.includes(p.id)))
    setSearchingProducts(false)
  }

  const openCreate = () => {
    setEditingPost(null)
    setForm(emptyForm)
    setLinkedProducts([])
    setShowForm(true)
  }

  const openEdit = async (post: BlogPost) => {
    setEditingPost(post)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      image_url: post.image_url,
      status: post.status || "draft",
      category_tag: post.category_tag || "",
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
    })
    await fetchLinkedProducts(post.id)
    setShowForm(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split(".").pop()
    const path = `blog/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("blog-images").upload(path, file)
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" })
      setUploading(false); return
    }
    const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" }); return
    }
    setSaving(true)
    const slug = form.slug || slugify(form.title)
    const payload = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim() || null,
      content: form.content || null,
      image_url: form.image_url,
      status: form.status,
      category_tag: form.category_tag.trim() || null,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
    }

    let postId = editingPost?.id
    if (editingPost) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editingPost.id)
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single()
      if (error || !data) { toast({ title: "Create failed", description: error?.message, variant: "destructive" }); setSaving(false); return }
      postId = data.id
    }

    // Sync linked products
    if (postId) {
      await supabase.from("blog_post_products").delete().eq("blog_post_id", postId)
      if (linkedProducts.length > 0) {
        await supabase.from("blog_post_products").insert(
          linkedProducts.map((p, i) => ({ blog_post_id: postId, product_id: p.id, display_order: i }))
        )
      }
    }

    toast({ title: editingPost ? "Post updated" : "Post created" })
    setShowForm(false)
    setSaving(false)
    fetchPosts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return
    setActionLoading(id)
    await supabase.from("blog_post_products").delete().eq("blog_post_id", id)
    await supabase.from("blog_posts").delete().eq("id", id)
    toast({ title: "Post deleted" })
    setActionLoading(null)
    fetchPosts()
  }

  const togglePublish = async (post: BlogPost) => {
    setActionLoading(post.id)
    const newStatus = post.status === "published" ? "draft" : "published"
    await supabase.from("blog_posts").update({
      status: newStatus,
    }).eq("id", post.id)
    toast({ title: newStatus === "published" ? "Post published" : "Post unpublished" })
    setActionLoading(null)
    fetchPosts()
  }

  const filtered = posts.filter(p => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (statusFilter === "published" && p.status !== "published") return false
    if (statusFilter === "draft" && p.status !== "draft") return false
    return true
  })

  if (loading) return <AdminTableSkeleton />

  // ─── Form View ────────────────────────────────────────────────────
  if (showForm) {
    return (
      <motion.div initial="hidden" animate="visible" className="flex flex-col gap-4">
        <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            {editingPost ? "Edit Post" : "New Post"}
          </h1>
          <button onClick={() => setShowForm(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main editor */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {/* Title */}
            <div className="bg-card rounded-xl border border-border p-4">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Title</label>
              <input
                value={form.title}
                onChange={e => {
                  setForm(f => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))
                }}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Blog post title"
              />
            </div>

            {/* Slug */}
            <div className="bg-card rounded-xl border border-border p-4">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Slug (URL)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground">/blog/</span>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="auto-generated-from-title"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-card rounded-xl border border-border p-4">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-[13px] text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Short summary for previews..."
              />
            </div>

            {/* HTML Content */}
            <div className="bg-card rounded-xl border border-border p-4">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Content (HTML supported)
              </label>
              <p className="text-[10px] text-muted-foreground mb-2">
                Use HTML tags like {'<h2>'}, {'<p>'}, {'<ul>'}, {'<a>'}, {'<img>'}, {'<strong>'}, {'<em>'}, etc.
              </p>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={16}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-[12px] text-foreground font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={'<h2>Introduction</h2>\n<p>Your blog content here...</p>'}
              />
            </div>

            {/* Linked Products */}
            <div className="bg-card rounded-xl border border-border p-4">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Linked Products
              </label>
              <p className="text-[10px] text-muted-foreground mb-2">Connect relevant products to this blog post.</p>

              {/* Search products */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); searchProducts(e.target.value) }}
                  className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Search products to link..."
                />
                {searchingProducts && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />}
              </div>

              {/* Search results */}
              {productResults.length > 0 && (
                <div className="border border-border rounded-lg mb-2 max-h-40 overflow-y-auto">
                  {productResults.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setLinkedProducts(prev => [...prev, p])
                        setProductResults(r => r.filter(x => x.id !== p.id))
                        setProductSearch("")
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary/40 transition-colors cursor-pointer"
                    >
                      {p.image_url ? (
                        <Image src={p.image_url} alt="" width={28} height={28} className="rounded object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center"><Package className="w-3 h-3 text-muted-foreground" /></div>
                      )}
                      <span className="text-[12px] text-foreground truncate">{p.name}</span>
                      <Plus className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Linked list */}
              {linkedProducts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {linkedProducts.map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/60 rounded-lg text-[11px] font-medium text-foreground">
                      {p.name}
                      <button onClick={() => setLinkedProducts(lp => lp.filter(x => x.id !== p.id))} className="hover:text-destructive transition-colors cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground italic">No products linked yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-3">
            {/* Featured Image */}
            <div className="bg-card rounded-xl border border-border p-4">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Featured Image</label>
              {form.image_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                  <Image src={form.image_url} alt="Featured" fill className="object-cover" />
                  <button
                    onClick={() => setForm(f => ({ ...f, image_url: null }))}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-md hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 hover:border-primary/40 hover:bg-primary/[0.02] transition-colors cursor-pointer"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">Upload image</span>
                    </>
                  )}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {/* Or paste URL */}
              <div className="flex items-center gap-1.5 mt-2">
                <Link2 className="w-3 h-3 text-muted-foreground shrink-0" />
                <input
                  value={form.image_url || ""}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value || null }))}
                  className="flex-1 bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Or paste image URL"
                />
              </div>
            </div>

            {/* Publish settings */}
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-secondary/50 border border-border rounded px-2.5 py-2 text-[12px] text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Category Tag</label>
                <input
                  value={form.category_tag}
                  onChange={e => setForm(f => ({ ...f, category_tag: e.target.value }))}
                  className="w-full bg-secondary/50 border border-border rounded px-2.5 py-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="e.g. Guide, News, Tips"
                />
              </div>
            </div>

            {/* SEO */}
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3" />
                SEO Settings
              </label>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Meta Title</label>
                <input
                  value={form.meta_title}
                  onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
                  className="w-full bg-secondary/50 border border-border rounded px-2.5 py-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Custom title for search engines"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Meta Description</label>
                <textarea
                  value={form.meta_description}
                  onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                  rows={3}
                  className="w-full bg-secondary/50 border border-border rounded px-2.5 py-2 text-[12px] text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Description for search results"
                />
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground text-[13px] font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ─── List View ────────────────────────────────────────────────────
  return (
    <motion.div initial="hidden" animate="visible" className="flex flex-col gap-4">
      <motion.div variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-primary" />
            Blogs Management
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {posts.length} post{posts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button onClick={openCreate} className="self-start flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </motion.div>

      <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-card border border-border rounded-lg text-[13px] font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} custom={2} className="rounded-2xl border border-border bg-card p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-foreground mb-1">No blog posts yet</p>
          <p className="text-[12px] text-muted-foreground">Create your first post to get started.</p>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} custom={2} className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Post</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(post => (
                  <tr key={post.id} className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {post.image_url ? (
                          <Image src={post.image_url} alt="" width={40} height={40} className="rounded-lg object-cover w-10 h-10" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-foreground line-clamp-1">{post.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">/blog/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-[12px] text-foreground">{post.category_tag || "-"}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-[12px] text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        post.status === "published" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-0.5">
                        {post.status === "published" && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer" title="View">
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                          </a>
                        )}
                        <button
                          onClick={() => togglePublish(post)}
                          disabled={actionLoading === post.id}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title={post.status === "published" ? "Unpublish" : "Publish"}
                        >
                          {post.status === "published" ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                        <button onClick={() => openEdit(post)} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer" title="Edit">
                          <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={actionLoading === post.id}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
