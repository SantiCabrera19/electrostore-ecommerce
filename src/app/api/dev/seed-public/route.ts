import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { NextResponse } from "next/server"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient<Database>(url, serviceKey, { auth: { persistSession: false } })
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden in production" }, { status: 403 })
  }

  const supabase = getAdminClient()

  const categoryNames = ["Refrigeración", "Lavado", "Cocina", "Climatización", "Audio y Video"] as const

  const categoryIds: Record<string, string> = {}
  for (const name of categoryNames) {
    const { data: existing } = await supabase.from("categories").select("id").eq("name", name).maybeSingle()

    if (existing?.id) {
      categoryIds[name] = existing.id
      continue
    }
    const { data: inserted, error: insertErr } = await supabase
      .from("categories")
      .insert([{ name }])
      .select("id")
      .single()
      
    if (insertErr || !inserted) {
      return NextResponse.json({ error: insertErr?.message ?? "Failed to insert category" }, { status: 500 })
    }
    categoryIds[name] = inserted.id
  }

  const seedProducts = [
    {
      name: "Refrigerador Samsung 500L",
      description: "Refrigerador de acero inoxidable con tecnología No Frost",
      price: 89999,
      images: ["/modern-stainless-steel-refrigerator.png"],
      specs: { original_price: 99999, installments: "12 cuotas sin interés", has_offer: true },
      categoryName: "Refrigeración",
    },
    {
      name: "Lavarropas LG 8kg",
      description: "Lavarropas automático con 14 programas de lavado",
      price: 65999,
      images: ["/placeholder-r167c.png"],
      specs: { installments: "6 cuotas sin interés" },
      categoryName: "Lavado",
    },
    {
      name: "Microondas Panasonic 25L",
      description: "Microondas con grill y función descongelar",
      price: 24999,
      images: ["/placeholder-x639d.png"],
      specs: { installments: "3 cuotas sin interés" },
      categoryName: "Cocina",
    },
    {
      name: "Aire Acondicionado Split 3000F",
      description: "Aire acondicionado frío/calor con control remoto",
      price: 125999,
      images: ["/placeholder-f79j1.png"],
      specs: { original_price: 139999, installments: "18 cuotas sin interés", has_offer: true },
      categoryName: "Climatización",
    },
    {
      name: "Lavavajillas Bosch 12 Servicios",
      description: "Lavavajillas con 6 programas de lavado",
      price: 78999,
      images: ["/placeholder-g6by8.png"],
      specs: { installments: "9 cuotas sin interés" },
      categoryName: "Cocina",
    },
    {
      name: "Smart TV Samsung 55\"",
      description: "Smart TV 4K con sistema operativo Tizen",
      price: 89999,
      images: ["/placeholder-nyt4k.png"],
      specs: { original_price: 99999, installments: "12 cuotas sin interés", has_offer: true },
      categoryName: "Audio y Video",
    },
  ] as const

  let insertedProductsCount = 0
  for (const p of seedProducts) {
    const { data: exists } = await supabase.from("products").select("id").eq("name", p.name).maybeSingle()

    if (exists?.id) continue

    const categoryId = categoryIds[p.categoryName]
    if (!categoryId) {
      return NextResponse.json({ error: `Categoría no encontrada para el producto: ${p.name}` }, { status: 500 })
    }

    const { error: insErr } = await supabase.from("products").insert([{
      name: p.name,
      description: p.description,
      price: p.price,
      stock: 100,
      images: [...p.images],
      specs: p.specs,
      category_id: categoryId,
    }])
    if (insErr) {
      return NextResponse.json({ error: insErr.message, at: p.name }, { status: 500 })
    }
    insertedProductsCount++
  }

  return NextResponse.json({
    ok: true,
    categories: categoryNames.length,
    productsInserted: insertedProductsCount,
    note: "Las imágenes se referencian desde /public, no se subieron a storage.",
  })
}