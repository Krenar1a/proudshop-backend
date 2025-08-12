import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
  const res = await fetch(`${API_BASE}/products/${id}`)
  if (res.status === 404) return NextResponse.json({ error: 'Produkti nuk u gjet' }, { status: 404 })
  if (!res.ok) return NextResponse.json({ error: 'Gabim në server' }, { status: res.status })
  const product = await res.json()
  return NextResponse.json({ product })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({ error: 'Gabim në server' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const name = body.name ?? body.title
    const price_raw = body.price ?? body.price_eur
    const payload: any = {
      title: name,
      description: body.description,
      price_eur: price_raw != null ? Number(price_raw) : undefined,
      price_lek: body.price_lek != null ? Number(body.price_lek) : 0,
      stock: body.stockQuantity != null ? Number.parseInt(body.stockQuantity) : (body.stock != null ? Number.parseInt(body.stock) : undefined),
      category_id: body.categoryId != null ? Number.parseInt(body.categoryId) : (body.category_id != null ? Number.parseInt(body.category_id) : undefined),
  images: Array.isArray(body.images) ? JSON.stringify(body.images) : (typeof body.images === 'string' ? body.images : undefined),
      tags: body.tags,
      sku: body.sku
    }
  const result = await backendCall(request, `/products/${id}`, { method: 'PUT', body: payload })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, product: result.data, message: 'Produkti u përditësua me sukses' })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: 'Gabim në përditësimin e produktit' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
  const result = await backendCall(request, `/products/${id}`, { method: 'DELETE' })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, message: 'Produkti u fshi me sukses' })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: 'Gabim në fshirjen e produktit' }, { status: 500 })
  }
}
