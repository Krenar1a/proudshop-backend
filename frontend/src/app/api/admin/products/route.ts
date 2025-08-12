import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

// This route now proxies to backend FastAPI /products admin listing & creation

// GET - Merr të gjithë produktet për admin
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '10'
  const search = searchParams.get('search')
  const category = searchParams.get('categoryId')
  const qs = new URLSearchParams({ page, limit })
  if (search) qs.set('search', search)
  if (category) qs.set('category', category)
  const result = await backendCall(request, `/products?${qs.toString()}`)
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  // Normalize products to admin UI expected shape
  const data = result.data || {}
  const normalized = {
    ...data,
    products: Array.isArray(data.products) ? data.products.map((p: any) => ({
      id: p.id,
      name: p.name ?? p.title ?? '',
      price: Number(p.price ?? p.price_eur ?? 0),
      stockQuantity: Number(p.stockQuantity ?? p.stock ?? 0),
      category: {
        name: p.category?.name ?? p.category_name ?? String(p.category_id ?? p.categoryId ?? '')
      },
      isActive: Boolean(p.isActive ?? true),
      isFeatured: Boolean(p.isFeatured ?? false),
      createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
      images: typeof p.images === 'string' || Array.isArray(p.images) ? p.images : undefined,
      shortDesc: p.shortDesc ?? p.description ?? '',
      brand: p.brand ?? ''
    })) : []
  }
  const resp = NextResponse.json(normalized)
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

// POST - Krijo produkt të ri
export async function POST(request: NextRequest) {
  const body = await request.json()
  const name: string | undefined = body.name ?? body.title
  // Accept either 'price' or 'price_eur'
  const priceRaw: any = body.price ?? body.price_eur
  // Accept either 'stockQuantity' or 'stock'
  const stockRaw: any = body.stockQuantity ?? body.stock
  const categoryId: any = body.categoryId ?? body.category_id

  if (!name || name.toString().trim() === '' || priceRaw === undefined || priceRaw === null || !categoryId) {
    return NextResponse.json({ error: 'Emri, çmimi dhe kategoria janë të detyrueshme' }, { status: 400 })
  }

  const price_eur = Number(priceRaw)
  if (Number.isNaN(price_eur)) {
    return NextResponse.json({ error: 'Çmimi nuk është i vlefshëm' }, { status: 400 })
  }

  const stock = Number.parseInt(stockRaw ?? '0')
  const category_id = Number.parseInt(categoryId)
  if (Number.isNaN(category_id)) {
    return NextResponse.json({ error: 'Kategoria nuk është e vlefshme' }, { status: 400 })
  }

  // Backend expects: title, description, price_eur, price_lek, stock, category_id
  const payload = {
    title: name,
    description: body.description || '',
    price_eur,
  // Backend schema requires price_lek; send 0 by default if missing
  price_lek: body.price_lek != null ? Number(body.price_lek) : 0,
  stock: Number.isNaN(stock) ? 0 : stock,
  category_id,
  images: Array.isArray(body.images) ? JSON.stringify(body.images) : (typeof body.images === 'string' ? body.images : undefined)
  }

  const result = await backendCall(request, '/products/', { method: 'POST', body: payload })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, product: result.data, message: 'Produkti u krijua me sukses' })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
