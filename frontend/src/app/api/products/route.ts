import { NextRequest, NextResponse } from 'next/server'
import { generateProductDescription, generateProductImage } from '@/lib/openai'
import { authClient } from '@/lib/authClient'

interface ProductWithReviews {
  id: string
  name: string
  description: string
  price: number
  thumbnail: string | null
  images: string
  tags: string
  category: { name: string }
  reviews: { rating: number }[]
  isFeatured: boolean
  stockQuantity: number
  createdAt: Date
}

interface WhereClause {
  category?: { slug: string }
  OR?: Array<{ name: { contains: string, mode?: string } } | { description: { contains: string, mode?: string } }>
  AND?: Array<Record<string, unknown>>
  isFeatured?: boolean
  discountPrice?: { not: null }
  discountPercentage?: { gt: number }
  isActive: boolean
}

interface OrderByClause {
  name?: 'asc' | 'desc'
  price?: 'asc' | 'desc'
  rating?: 'asc' | 'desc'
  createdAt?: 'asc' | 'desc'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qs = new URLSearchParams()
    for (const key of ['page','limit','category','search','featured','offers','sort']) {
      const v = searchParams.get(key)
      if (v) qs.set(key, v)
    }
    // Delegate listing logic to backend (implement similar filters server-side)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/products?${qs.toString()}`)
    if (!res.ok) {
      return NextResponse.json({ error: 'Gabim në marrjen e produkteve' }, { status: res.status })
    }
    const data = await res.json()
    // Normalize backend products -> frontend shape expected by pages (name/price/image/category...)
    const rawList = Array.isArray(data?.products)
      ? data.products
      : Array.isArray(data)
        ? data
        : []
    const mapped = rawList.map((p: any) => {
      const price = Number(p?.price ?? p?.price_eur ?? 0) || 0
      const discountPrice = p?.discountPrice != null
        ? Number(p.discountPrice)
        : (p?.discount_price_eur != null ? Number(p.discount_price_eur) : undefined)
      // Parse images if backend stores as JSON string
      const imgsRaw = Array.isArray(p?.images) ? p.images : (typeof p?.images === 'string' ? (() => { try { return JSON.parse(p.images) } catch { return [] } })() : [])
      const imgUrls: string[] = (imgsRaw || []).map((it: any) => typeof it === 'string' ? it : (it?.url || '')).filter(Boolean)
      const firstImage = imgUrls?.[0] || p?.thumbnail || p?.image || ''
      const stockQty = Number(p?.stockQuantity ?? p?.stock ?? 0) || 0
      return {
        id: String(p?.id ?? ''),
        name: p?.name ?? p?.title ?? 'Produkt',
        description: p?.description ?? '',
        price,
        discountPrice,
        discountPercentage: p?.discountPercentage ?? (discountPrice != null ? Math.max(0, Math.round(((price - discountPrice) / (price || 1)) * 100)) : undefined),
        image: firstImage,
        thumbnail: firstImage,
        rating: Number(p?.rating ?? 0) || 0,
        reviewCount: Number(p?.reviewCount ?? 0) || 0,
        category: { name: p?.category?.name ?? 'Kategoria' },
        images: imgUrls,
        stockQuantity: stockQty
      }
    })
    return NextResponse.json({ products: mapped, pagination: data?.pagination })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Gabim në marrjen e produkteve' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    let { description, images, name, tags, generateAIDescription, generateAIImage, ...rest } = data

    // Optional AI enrichment (frontend) before sending to backend
    if (generateAIDescription && !description) {
      const aiDescription = await generateProductDescription(name, tags || [])
      if (aiDescription.success) description = aiDescription.description
    }
    if (generateAIImage) {
      const imagePrompt = `Professional product photo of ${name}, white background, high quality, e-commerce style`
      const aiImage = await generateProductImage({ prompt: imagePrompt })
      if (aiImage.success && aiImage.images && aiImage.images.length > 0) {
        images = [...aiImage.images, ...(images || [])]
      }
    }

    const payload = { ...rest, name, description, images, tags }
    const product = await authClient.fetch('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Gabim në krijimin e produktit' }, { status: 500 })
  }
}
