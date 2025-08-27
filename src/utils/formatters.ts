/**
 * Utility functions for formatting data
 */

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}

export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj)
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX for 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  // Return original if not 10 digits
  return phone
}

export function formatOrderNumber(orderId: string): string {
  // Take first 8 characters and format as order number
  return `#${orderId.slice(0, 8).toUpperCase()}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
