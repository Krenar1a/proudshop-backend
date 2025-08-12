import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface ProductWithCategory {
  id: string
  name: string
  price: number
  discountPrice?: number
  thumbnail?: string
  images: string
  category: { name: string }
  stockQuantity: number
  inStock: boolean
  isActive: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity = 1 } = body
    if (!productId) return NextResponse.json({ error: 'ID e produktit është e detyrueshme' }, { status: 400 })
    const res = await fetch(`${API_BASE}/products/${productId}`)
    if (res.status === 404) return NextResponse.json({ error: 'Produkti nuk u gjet' }, { status: 404 })
    if (!res.ok) return NextResponse.json({ error: 'Gabim në server' }, { status: res.status })
    const product = await res.json()
    // Backend product schema uses title/price_eur/price_lek/stock
    if (product.stock < quantity) {
      return NextResponse.json({ error: `Në stok janë vetëm ${product.stock} copë` }, { status: 400 })
    }
    return NextResponse.json({
      success: true,
      item: {
        id: product.id,
        name: product.title,
        price: product.price_eur,
        originalPrice: product.price_eur,
        image: null, // backend minimal spec; extend when images supported
        category: product.category_id || null,
        quantity,
        inStock: product.stock,
        total: product.price_eur * quantity
      }
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Gabim në shtimin e produktit në shportë' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('productIds')?.split(',').filter(Boolean) || []
    if (productIds.length === 0) return NextResponse.json({ items: [] })
    const items = [] as any[]
    for (const id of productIds) {
      const res = await fetch(`${API_BASE}/products/${id}`)
      if (!res.ok) continue
      const p = await res.json()
      items.push({
        id: p.id,
        name: p.title,
        price: p.price_eur,
        originalPrice: p.price_eur,
        image: null,
        category: p.category_id || null,
        inStock: p.stock,
        isAvailable: p.stock > 0
      })
    }
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return NextResponse.json({ error: 'Gabim në marrjen e produkteve të shportës' }, { status: 500 })
  }
}
