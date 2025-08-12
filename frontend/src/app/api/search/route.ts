import { NextRequest, NextResponse } from 'next/server'

interface SearchWhereClause {
  isActive: boolean
  OR?: Array<{
    name?: { contains: string; mode: string }
    description?: { contains: string; mode: string }
    tags?: { hasSome: string[] }
    brand?: { contains: string; mode: string }
    AND?: Array<Record<string, unknown>>
  }>
  category?: { slug: string }
}

interface OrderByClause {
  createdAt?: 'asc' | 'desc'
  price?: 'asc' | 'desc'
  name?: 'asc' | 'desc'
  views?: 'asc' | 'desc'
}

interface ProductWithReviews {
  id: string
  name: string
  description: string
  shortDesc?: string
  price: number
  discountPrice?: number
  discountPercentage?: number
  thumbnail?: string
  images: string[]
  category: { id: string; name: string; slug: string }
  brand?: string
  inStock: boolean
  stockQuantity: number
  isFeatured: boolean
  tags: string[]
  reviews: { rating: number }[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qs = new URLSearchParams()
    for (const key of ['q','category','minPrice','maxPrice','page','limit','sort']) {
      const v = searchParams.get(key)
      if (v) qs.set(key, v)
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/search?${qs.toString()}`)
    if (!res.ok) {
      return NextResponse.json({ error: 'Gabim në kërkimin e produkteve' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json({ error: 'Gabim në kërkimin e produkteve' }, { status: 500 })
  }
}
