"use client"

import { useParams } from "next/navigation"
import AdminProductForm from "@/components/admin-product-form"

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string
  return <AdminProductForm productId={id} />
}
