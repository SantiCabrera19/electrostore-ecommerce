// Script para debuggear categorías y productos
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugCategories() {
  console.log('=== DEBUG CATEGORÍAS ===')
  
  // Obtener todas las categorías
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('id')
  
  if (catError) {
    console.error('Error categorías:', catError)
    return
  }
  
  console.log('\nCATEGORÍAS:')
  categories.forEach(cat => {
    console.log(`ID: ${cat.id} | Nombre: ${cat.name}`)
  })
  
  // Obtener todos los productos con sus categorías
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, category_id')
    .order('category_id')
  
  if (prodError) {
    console.error('Error productos:', prodError)
    return
  }
  
  console.log('\nPRODUCTOS POR CATEGORÍA:')
  categories.forEach(cat => {
    const productsInCategory = products.filter(p => p.category_id === cat.id)
    console.log(`\n${cat.name} (ID: ${cat.id}):`)
    if (productsInCategory.length === 0) {
      console.log('  ❌ SIN PRODUCTOS')
    } else {
      productsInCategory.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id})`)
      })
    }
  })
  
  // Productos sin categoría
  const orphanProducts = products.filter(p => !categories.find(c => c.id === p.category_id))
  if (orphanProducts.length > 0) {
    console.log('\n🚨 PRODUCTOS SIN CATEGORÍA VÁLIDA:')
    orphanProducts.forEach(p => {
      console.log(`  - ${p.name} (category_id: ${p.category_id})`)
    })
  }
}

debugCategories().catch(console.error)
