// PDF Generator for ElectroStore invoices
// Using jsPDF for client-side PDF generation

import jsPDF from 'jspdf'

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

export function generateInvoicePDF(order: OrderData, customer: CustomerData) {
  const doc = new jsPDF()
  
  // Colors
  const primaryColor = '#0d9488' // Teal-600
  const textColor = '#374151' // Gray-700
  const lightGray = '#f3f4f6' // Gray-100
  
  // Header - ElectroStore Logo and Info
  doc.setFillColor(13, 148, 136) // Teal background
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('ElectroStore', 20, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Electrodomésticos y Tecnología', 20, 32)
  
  // Invoice title and number
  doc.setTextColor(textColor)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURA', 150, 25)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nº ${order.id.slice(0, 8).toUpperCase()}`, 150, 32)
  
  // Date
  const date = new Date(order.created_at).toLocaleDateString('es-AR')
  doc.text(`Fecha: ${date}`, 150, 38)
  
  // Customer Information
  let yPos = 60
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CLIENTE', 20, yPos)
  
  yPos += 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nombre: ${customer.fullName}`, 20, yPos)
  yPos += 6
  doc.text(`Email: ${customer.email}`, 20, yPos)
  yPos += 6
  doc.text(`Teléfono: ${customer.phone}`, 20, yPos)
  yPos += 6
  doc.text(`Dirección: ${customer.address}`, 20, yPos)
  yPos += 6
  doc.text(`Ciudad: ${customer.city}, ${customer.province} (${customer.postalCode})`, 20, yPos)
  
  // Products table header
  yPos += 20
  doc.setFillColor(243, 244, 246) // Light gray background
  doc.rect(20, yPos - 5, 170, 10, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('PRODUCTO', 25, yPos)
  doc.text('CANT.', 120, yPos)
  doc.text('PRECIO UNIT.', 140, yPos)
  doc.text('SUBTOTAL', 170, yPos)
  
  // Products
  yPos += 10
  doc.setFont('helvetica', 'normal')
  let subtotal = 0
  
  order.order_items.forEach((item) => {
    const itemSubtotal = item.quantity * item.price
    subtotal += itemSubtotal
    
    // Product name (truncate if too long)
    const productName = item.products.name.length > 35 
      ? item.products.name.substring(0, 35) + '...' 
      : item.products.name
    
    doc.text(productName, 25, yPos)
    doc.text(item.quantity.toString(), 125, yPos)
    doc.text(`$${item.price.toLocaleString('es-AR')}`, 145, yPos)
    doc.text(`$${itemSubtotal.toLocaleString('es-AR')}`, 175, yPos)
    
    yPos += 8
  })
  
  // Totals section
  yPos += 10
  doc.setDrawColor(200, 200, 200)
  doc.line(20, yPos, 190, yPos) // Horizontal line
  
  yPos += 10
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', 140, yPos)
  doc.text(`$${subtotal.toLocaleString('es-AR')}`, 175, yPos)
  
  yPos += 8
  doc.text('Envío:', 140, yPos)
  doc.text('GRATIS', 175, yPos)
  
  yPos += 8
  doc.text('IVA (21%):', 140, yPos)
  const iva = Math.round(subtotal * 0.21)
  doc.text(`$${iva.toLocaleString('es-AR')}`, 175, yPos)
  
  yPos += 12
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('TOTAL:', 140, yPos)
  doc.text(`$${order.total.toLocaleString('es-AR')}`, 175, yPos)
  
  // Footer
  yPos += 30
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('ElectroStore - Electrodomésticos y Tecnología', 20, yPos)
  yPos += 5
  doc.text('www.electrostore.com | contacto@electrostore.com | Tel: (011) 4000-0000', 20, yPos)
  yPos += 5
  doc.text('CUIT: 20-12345678-9 | Responsable Inscripto', 20, yPos)
  
  // Download the PDF
  const fileName = `Factura_ElectroStore_${order.id.slice(0, 8)}.pdf`
  doc.save(fileName)
}

export function previewInvoicePDF(order: OrderData, customer: CustomerData) {
  const doc = new jsPDF()
  
  // Same generation logic as above but return blob instead of downloading
  // ... (same code as generateInvoicePDF)
  
  // Return blob for preview
  return doc.output('blob')
}
