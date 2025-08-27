// PDF Generator for ElectroStore invoices
// Using jsPDF for client-side PDF generation

import jsPDF from 'jspdf'

// Function to load image as base64
function getImageDataURL(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = function() {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imagePath
  })
}

interface OrderData {
  id: string
  total: number
  created_at: string
  order_items: Array<{
    quantity: number
    price: number
    products: {
      name: string
      description: string
    }
  }>
}

interface CustomerData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
}

export async function generateInvoicePDF(order: OrderData, customer: CustomerData) {
  const doc = new jsPDF()
  
  // Load logo image
  let logoDataURL: string | null = null
  try {
    logoDataURL = await getImageDataURL('/electrostore_Logo.png')
  } catch (error) {
    console.warn('Could not load logo image:', error)
  }
  
  // Colors inspired by Cetrogar
  const primaryBlue = '#1e40af' // Blue-700
  const secondaryBlue = '#3b82f6' // Blue-500
  const lightBlue = '#dbeafe' // Blue-100
  const darkGray = '#1f2937' // Gray-800
  const mediumGray = '#6b7280' // Gray-500
  const lightGray = '#f9fafb' // Gray-50
  
  // Header with dual-color design inspired by Cetrogar
  doc.setFillColor(30, 64, 175) // Primary blue background
  doc.rect(0, 0, 210, 35, 'F')
  
  // Secondary blue stripe
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 35, 210, 8, 'F')
  
  // Logo in header (left side)
  if (logoDataURL) {
    doc.addImage(logoDataURL, 'PNG', 20, 8, 18, 18)
  }
  
  // Company info in header (next to logo)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('ElectroStore', logoDataURL ? 42 : 20, 22)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Electrodomésticos y Tecnología Premium', logoDataURL ? 42 : 20, 30)
  
  // Invoice type and number in header box
  doc.setFillColor(255, 255, 255)
  doc.rect(140, 10, 55, 20, 'F')
  doc.setDrawColor(30, 64, 175)
  doc.setLineWidth(1)
  doc.rect(140, 10, 55, 20)
  
  doc.setTextColor(30, 64, 175)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURA', 155, 18)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nº ES-${order.id.slice(0, 6).toUpperCase()}`, 145, 25)
  
  // Date below header
  const date = new Date(order.created_at).toLocaleDateString('es-AR')
  doc.setTextColor(darkGray)
  doc.text(`Fecha de Emisión: ${date}`, 145, 50)
  
  // Company details section (like Cetrogar)
  let yPos = 60
  doc.setFillColor(219, 234, 254) // Light blue background
  doc.rect(15, yPos - 5, 85, 35, 'F')
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.rect(15, yPos - 5, 85, 35)
  
  doc.setTextColor(30, 64, 175)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('ElectroStore S.A.', 18, yPos + 3)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(darkGray)
  doc.text('Domicilio: Av. Corrientes 1234', 18, yPos + 9)
  doc.text('CUIT: 30-12345678-9', 18, yPos + 14)
  doc.text('IVA RESPONSABLE INSCRIPTO', 18, yPos + 19)
  doc.text('Inicio de Actividades: 01/01/2020', 18, yPos + 24)
  
  // Customer section (expanded height for more data)
  doc.setFillColor(249, 250, 251) // Very light gray
  doc.rect(110, yPos - 5, 85, 40, 'F')
  doc.setDrawColor(107, 114, 128)
  doc.rect(110, yPos - 5, 85, 40)
  
  doc.setTextColor(30, 64, 175)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CLIENTE', 113, yPos + 3)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(darkGray)
  
  // Format customer data properly
  const customerName = customer.fullName || 'Cliente no especificado'
  const customerEmail = customer.email || 'email@no-especificado.com'
  const customerPhone = customer.phone || 'Teléfono no especificado'
  const customerAddress = customer.address || 'Dirección no especificada'
  const customerCity = customer.city || 'Ciudad no especificada'
  const customerProvince = customer.province || 'Provincia no especificada'
  const customerPostalCode = customer.postalCode || 'CP no especificado'
  
  doc.text(customerName, 113, yPos + 9)
  doc.text(customerEmail, 113, yPos + 14)
  doc.text(customerPhone, 113, yPos + 19)
  doc.text(`${customerAddress}`, 113, yPos + 24)
  doc.text(`${customerCity}, ${customerProvince} (${customerPostalCode})`, 113, yPos + 29)
  
  // Products table with professional styling
  yPos += 55
  
  // Table header with gradient-like effect
  doc.setFillColor(30, 64, 175) // Dark blue header
  doc.rect(15, yPos - 8, 180, 12, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DESCRIPCIÓN DEL PRODUCTO', 18, yPos - 2)
  doc.text('CANT.', 130, yPos - 2)
  doc.text('P. UNIT.', 150, yPos - 2)
  doc.text('IMPORTE', 175, yPos - 2)
  
  // Products with alternating row colors
  yPos += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  let subtotal = 0
  let rowIndex = 0
  
  order.order_items.forEach((item) => {
    const itemSubtotal = item.quantity * item.price
    subtotal += itemSubtotal
    
    // Alternating row background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(249, 250, 251) // Very light gray
      doc.rect(15, yPos - 3, 180, 10, 'F')
    }
    
    doc.setTextColor(darkGray)
    
    // Product name with better formatting
    const productName = item.products.name.length > 40 
      ? item.products.name.substring(0, 40) + '...' 
      : item.products.name
    
    doc.text(productName, 18, yPos + 2)
    doc.text(item.quantity.toString(), 135, yPos + 2)
    doc.text(`$${item.price.toLocaleString('es-AR')}`, 155, yPos + 2)
    doc.text(`$${itemSubtotal.toLocaleString('es-AR')}`, 178, yPos + 2)
    
    // Add thin border line
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.2)
    doc.line(15, yPos + 5, 195, yPos + 5)
    
    yPos += 10
    rowIndex++
  })
  
  // Totals section with professional box design
  yPos += 15
  
  // Totals box background
  doc.setFillColor(249, 250, 251)
  doc.rect(120, yPos - 5, 75, 45, 'F')
  doc.setDrawColor(30, 64, 175)
  doc.setLineWidth(1)
  doc.rect(120, yPos - 5, 75, 45)
  
  doc.setTextColor(darkGray)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  doc.text('Subtotal:', 125, yPos + 5)
  doc.text(`$${subtotal.toLocaleString('es-AR')}`, 175, yPos + 5)
  
  doc.text('Descuento:', 125, yPos + 12)
  doc.text('$0,00', 175, yPos + 12)
  
  doc.text('IVA (21%):', 125, yPos + 19)
  const iva = Math.round(subtotal * 0.21)
  doc.text(`$${iva.toLocaleString('es-AR')}`, 175, yPos + 19)
  
  // Total with emphasis
  doc.setFillColor(30, 64, 175)
  doc.rect(120, yPos + 25, 75, 12, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL:', 125, yPos + 33)
  doc.text(`$${order.total.toLocaleString('es-AR')}`, 175, yPos + 33)
  
  // Professional footer with logo space and legal info
  yPos += 60
  
  // Footer separator line
  doc.setDrawColor(30, 64, 175)
  doc.setLineWidth(1)
  doc.line(15, yPos, 195, yPos)
  
  yPos += 10
  
  // Company info on left
  doc.setTextColor(mediumGray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('ElectroStore S.A. - Electrodomésticos y Tecnología Premium', 20, yPos)
  yPos += 4
  doc.text('www.electrostore.com | ventas@electrostore.com | Tel: (011) 4000-0000', 20, yPos)
  yPos += 4
  doc.text('CUIT: 30-12345678-9 | Responsable Inscripto | Defensa del Consumidor', 20, yPos)
  
  // Logo in bottom right corner
  if (logoDataURL) {
    // Background box for logo
    doc.setFillColor(219, 234, 254)
    doc.rect(160, yPos - 18, 35, 18, 'F')
    doc.setDrawColor(30, 64, 175)
    doc.setLineWidth(0.5)
    doc.rect(160, yPos - 18, 35, 18)
    
    // Logo image
    doc.addImage(logoDataURL, 'PNG', 162, yPos - 16, 14, 14)
    
    // Company name next to logo
    doc.setTextColor(30, 64, 175)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('ElectroStore', 178, yPos - 8)
  } else {
    // Fallback if logo doesn't load
    doc.setFillColor(219, 234, 254)
    doc.rect(160, yPos - 15, 30, 15, 'F')
    doc.setDrawColor(30, 64, 175)
    doc.setLineWidth(0.5)
    doc.rect(160, yPos - 15, 30, 15)
    
    doc.setTextColor(30, 64, 175)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('ElectroStore', 165, yPos - 8)
  }
  
  // Download the PDF
  const fileName = `Factura_ElectroStore_ES${order.id.slice(0, 6)}.pdf`
  doc.save(fileName)
}

export function previewInvoicePDF(order: OrderData, customer: CustomerData) {
  const doc = new jsPDF()
  
  // Same generation logic as above but return blob instead of downloading
  // ... (same code as generateInvoicePDF)
  
  // Return blob for preview
  return doc.output('blob')
}
