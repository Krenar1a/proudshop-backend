import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

// Auth handled by backend; cookies are proxied and refreshed

// GET - Merr të gjitha porosite
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    
    const skip = (page - 1) * limit
    
  const result = await backendCall(request, '/orders/')
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const backendOrders = result.data as any[]
    let filtered = backendOrders
    if (status) filtered = filtered.filter(o => o.status === status)
    const totalCount = filtered.length
    const pageItems = filtered.slice(skip, skip + limit)
    const mapped = pageItems.map((o: any) => ({
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
      itemsCount: Array.isArray(o.items) ? o.items.length : 0
    }))
  const resp = NextResponse.json({ success: true, orders: mapped, pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) } })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Gabim në server' }, { status: 500 })
  }
}

// PUT - Përditëso statusin e porosisë
export async function PUT(request: NextRequest) {
  try {
    const { orderId, status, trackingNumber } = await request.json()
    
    if (!orderId || !status) {
      return NextResponse.json({ 
        error: 'ID e porosisë dhe statusi janë të detyrueshëm' 
      }, { status: 400 })
    }

  const result = await backendCall(request, `/orders/${orderId}/status`, { method: 'PUT', body: { status } })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, order: result.data, message: 'Statusi i porosisë u përditësua me sukses' })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ error: 'Gabim në përditësimin e porosisë' }, { status: 500 })
  }
}
