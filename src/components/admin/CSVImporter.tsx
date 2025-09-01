'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface CSVImporterProps {
  categories: { id: string; name: string }[]
  onImport: (products: any[]) => Promise<void>
}

interface ImportResult {
  success: number
  errors: string[]
  total: number
}

export default function CSVImporter({ categories, onImport }: CSVImporterProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const downloadTemplate = () => {
    const template = [
      'name,description,price,compare_at_price,stock,category_name,specs_color,specs_capacidad,specs_marca,specs_dimensiones,specs_eficiencia_energetica',
      'Refrigerador Samsung 500L,Heladera con freezer superior y tecnología no frost,150000,180000,10,Refrigeración,Plateado,500L,Samsung,60x65x180cm,A++',
      'Cocina LG 4 Hornallas,Cocina a gas con horno eléctrico y parrillas de hierro fundido,120000,,8,Cocina,Negro,4 hornallas,LG,90x60x85cm,',
      'Smart TV 55 Pulgadas,Televisor LED 4K con Android TV y control por voz,200000,250000,5,Televisores,Negro,55 pulgadas,Samsung,123x71x8cm,'
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla_productos.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) throw new Error('El archivo CSV debe tener al menos una fila de datos')

    // Parse CSV properly handling commas in quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0])
    const products = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length !== headers.length) {
        console.warn(`Fila ${i + 1}: Número de columnas no coincide (${values.length} vs ${headers.length})`)
        continue
      }

      const product: any = {}
      headers.forEach((header, index) => {
        product[header] = values[index]
      })

      // Validar campos requeridos
      if (!product.name || !product.price) {
        throw new Error(`Fila ${i + 1}: Nombre y precio son obligatorios`)
      }

      // Encontrar categoría
      const category = categories.find(c => 
        c.name.toLowerCase() === product.category_name?.toLowerCase()
      )
      if (!category) {
        throw new Error(`Fila ${i + 1}: Categoría "${product.category_name}" no encontrada`)
      }

      // Formatear producto según estructura real de BD
      const formattedProduct = {
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price),
        compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
        stock: parseInt(product.stock) || 0,
        category_id: category.id,
        images: [], // Se agregan manualmente después
        main_image: null, // Se asigna cuando se suben imágenes
        specs: {}, // Se llenan dinámicamente abajo
        active: true
      }

      // Agregar specs dinámicamente
      Object.keys(product).forEach(key => {
        if (key.startsWith('specs_') && product[key]) {
          const specName = key.replace('specs_', '')
          ;(formattedProduct.specs as Record<string, any>)[specName] = product[key]
        }
      })

      products.push(formattedProduct)
    }

    return products
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV válido",
        variant: "destructive"
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      console.log('🔄 Iniciando importación CSV...')
      const text = await file.text()
      console.log('📄 Contenido CSV:', text.substring(0, 200) + '...')
      
      const products = parseCSV(text)
      console.log('📦 Productos parseados:', products.length)
      
      let successCount = 0
      const errors: string[] = []

      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        try {
          console.log(`⏳ Importando producto ${i + 1}/${products.length}:`, product.name)
          await onImport([product])
          successCount++
          console.log(`✅ Producto importado: ${product.name}`)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
          console.error(`❌ Error importando ${product.name}:`, errorMsg)
          errors.push(`${product.name}: ${errorMsg}`)
        }
      }

      setImportResult({
        success: successCount,
        errors,
        total: products.length
      })

      if (successCount > 0) {
        toast({
          title: "Importación completada",
          description: `${successCount} productos importados exitosamente`,
        })
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('💥 Error general de importación:', errorMsg)
      toast({
        title: "Error de importación",
        description: errorMsg,
        variant: "destructive"
      })
      setImportResult({
        success: 0,
        errors: [errorMsg],
        total: 0
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Productos desde CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Plantilla
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importando...' : 'Seleccionar CSV'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        {importResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{importResult.success} de {importResult.total} productos importados</span>
            </div>
            
            {importResult.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Errores encontrados:</span>
                </div>
                <ul className="text-sm text-red-600 ml-6 space-y-1">
                  {importResult.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>• Y {importResult.errors.length - 5} errores más...</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Formato requerido:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Archivo CSV con encabezados</li>
            <li><strong>Campos obligatorios:</strong> name, price, category_name</li>
            <li><strong>Campos opcionales:</strong> description, compare_at_price, stock</li>
            <li><strong>Especificaciones:</strong> specs_color, specs_marca, specs_capacidad, specs_dimensiones, etc.</li>
            <li><strong>Categorías válidas:</strong> {categories.map(c => c.name).join(', ')}</li>
            <li><strong>Nota:</strong> Las imágenes se pueden agregar después editando cada producto</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
