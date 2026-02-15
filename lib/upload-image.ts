"use client"

import { createClient } from "@/lib/supabase/client"

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const path = `products/${fileName}`

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from("product-images").getPublicUrl(path)
  return data.publicUrl
}

export async function deleteProductImage(url: string): Promise<void> {
  const supabase = createClient()
  // Extract the path from the full URL
  const match = url.match(/product-images\/(.+)$/)
  if (!match) return
  const path = match[1]
  await supabase.storage.from("product-images").remove([path])
}
