import { NextRequest } from 'next/server'
import { api } from './api'

export async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return { valid: false, admin: null }
  try {
    // Call backend /auth/me
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
    if (!res.ok) return { valid: false, admin: null }
    const admin = await res.json()
    return { valid: true, admin: { ...admin, permissions: [] as string[] } }
  } catch (e) {
    return { valid: false, admin: null }
  }
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  if (currency === 'LEK') {
    return `${amount.toFixed(0)} LEK`
  }
  return `€${amount.toFixed(2)}`
}

export function detectCountryFromIP(ip: string): string {
  // This is a simplified implementation
  // In production, you would use a proper geolocation service
  if (ip.includes('albania') || ip.includes('tirana')) {
    return 'AL'
  }
  return 'XK' // Kosovo
}

interface ProductPrice {
  price: number
  priceEUR?: number
  priceLEK?: number
}

export function getPriceForCountry(product: ProductPrice, country: string): number {
  if (country === 'AL' && product.priceLEK) {
    return product.priceLEK
  }
  return product.priceEUR || product.price
}

export function getCurrencyForCountry(country: string): string {
  return country === 'AL' ? 'LEK' : 'EUR'
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export function calculateDiscount(price: number, discountPercentage: number): number {
  return price - (price * discountPercentage / 100)
}
