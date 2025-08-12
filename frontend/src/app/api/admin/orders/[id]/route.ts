import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('Get order details API called for order:', id)
  
  const result = await backendCall(request, `/orders/${id}`)
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const o: any = result.data
  const normalized = {
    id: String(o.id ?? ''),
    orderNumber: String(o.order_number ?? ''),
    customerName: (o.shipping_name && String(o.shipping_name))
      || (o.shipping_email && String(o.shipping_email))
      || (o.customer_id ? `ID:${o.customer_id}` : 'Guest'),
    shippingEmail: String(o.shipping_email ?? ''),
    shippingPhone: String(o.shipping_phone ?? ''),
    shippingAddress: String(o.shipping_address ?? ''),
    shippingCity: String(o.shipping_city ?? ''),
    shippingZip: String(o.shipping_zip ?? ''),
    total: Number(o.total_eur ?? 0),
    status: String(o.status ?? 'PENDING'),
    paymentStatus: 'PENDING',
    createdAt: o.created_at ? String(o.created_at) : new Date().toISOString(),
    itemsCount: Array.isArray(o.items) ? o.items.length : 0,
    orderItems: Array.isArray(o.items)
      ? o.items.map((it: any) => ({
          id: String(it.id ?? ''),
          productId: String(it.product_id ?? ''),
          quantity: Number(it.quantity ?? 0),
          price: Number(it.price_eur ?? 0),
          total: Number((Number(it.price_eur ?? 0) * Number(it.quantity ?? 0)) || 0),
          product: { name: `Produkti #${it.product_id ?? ''}`, images: undefined as unknown as string }
        }))
      : [] as any[],
    subtotal: Number(o.total_eur ?? 0),
    shipping: 0,
    tax: 0,
    notes: '',
    trackingNumber: ''
  }
  const resp = NextResponse.json({ success: true, order: normalized })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await backendCall(request, `/orders/${id}`, { method: 'DELETE' })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, message: 'Porosia u fshi me sukses' })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
