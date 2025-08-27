/**
 * Validation utilities for forms and data
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (!email.trim()) {
    errors.push('El email es requerido')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('El formato del email no es válido')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = []
  const cleaned = phone.replace(/\D/g, '')
  
  if (!phone.trim()) {
    errors.push('El teléfono es requerido')
  } else if (cleaned.length < 8) {
    errors.push('El teléfono debe tener al menos 8 dígitos')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  const errors: string[] = []
  
  if (!value.trim()) {
    errors.push(`${fieldName} es requerido`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePrice(price: string | number): ValidationResult {
  const errors: string[] = []
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice) || numPrice <= 0) {
    errors.push('El precio debe ser un número mayor a 0')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateStock(stock: string | number): ValidationResult {
  const errors: string[] = []
  const numStock = typeof stock === 'string' ? parseInt(stock) : stock
  
  if (isNaN(numStock) || numStock < 0) {
    errors.push('El stock debe ser un número mayor o igual a 0')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePostalCode(postalCode: string): ValidationResult {
  const errors: string[] = []
  const cleaned = postalCode.replace(/\D/g, '')
  
  if (!postalCode.trim()) {
    errors.push('El código postal es requerido')
  } else if (cleaned.length !== 4) {
    errors.push('El código postal debe tener 4 dígitos')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export interface CheckoutFormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  notes?: string
}

export function validateCheckoutForm(data: CheckoutFormData): ValidationResult {
  const allErrors: string[] = []
  
  const validations = [
    validateRequired(data.fullName, 'Nombre completo'),
    validateEmail(data.email),
    validatePhone(data.phone),
    validateRequired(data.address, 'Dirección'),
    validateRequired(data.city, 'Ciudad'),
    validateRequired(data.province, 'Provincia'),
    validatePostalCode(data.postalCode)
  ]
  
  validations.forEach(validation => {
    allErrors.push(...validation.errors)
  })
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}
