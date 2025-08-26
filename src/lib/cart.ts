// Cart utilities for localStorage management
export interface CartItem {
  productId: string
  quantity: number
}

export const CART_STORAGE_KEY = 'electrostore_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY)
    return cartData ? JSON.parse(cartData) : []
  } catch {
    return []
  }
}

export function addToCart(productId: string, quantity: number = 1): void {
  const cart = getCart()
  const existingItem = cart.find(item => item.productId === productId)
  
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  
  // Dispatch custom event for cart updates
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter(item => item.productId !== productId)
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
}

export function updateCartQuantity(productId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(productId)
    return
  }
  
  const cart = getCart()
  const item = cart.find(item => item.productId === productId)
  
  if (item) {
    item.quantity = quantity
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
  }
}

export function getCartItemCount(): number {
  return getCart().reduce((total, item) => total + item.quantity, 0)
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }))
}
