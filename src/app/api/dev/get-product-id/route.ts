import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productName = searchParams.get('name')
  
  if (!productName) {
    return NextResponse.json({ error: 'Product name required' }, { status: 400 })
  }

  const supabase = createServerClient()
  
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name')
    .eq('name', productName)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ 
    id: product.id, 
    name: product.name 
  })
}
