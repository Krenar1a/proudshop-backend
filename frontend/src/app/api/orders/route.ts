import { NextRequest, NextResponse } from 'next/server'
// Email sending now handled by backend; removed local email dispatch.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Transform UI cart payload to backend expected shape
    const payload = {
      customer_id: null,
      items: Array.isArray(body.items)
        ? body.items.map((i: any) => ({ product_id: Number(i.productId), quantity: Number(i.quantity) }))
        : [],
      shipping_name: body?.shippingInfo?.name || null,
      shipping_email: body?.shippingInfo?.email || null,
      shipping_phone: body?.shippingInfo?.phone || null,
      shipping_address: body?.shippingInfo?.address || null,
      shipping_city: body?.shippingInfo?.city || null,
      shipping_zip: body?.shippingInfo?.zipCode || null,
      shipping_country: body?.shippingInfo?.country || null,
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.detail || 'Gabim në krijimin e porosisë' }, { status: res.status })
    }
    const order = await res.json()

  // Backend already triggers confirmation email.

    // Normalize response to what checkout page expects
    return NextResponse.json({ order: { orderNumber: order.order_number, id: order.id } })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Gabim në krijimin e porosisë' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qs = new URLSearchParams()
    for (const key of ['orderNumber','email']) {
      const v = searchParams.get(key)
      if (v) qs.set(key, v)
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/orders?${qs.toString()}`)
    if (!res.ok) {
      return NextResponse.json({ error: 'Gabim në marrjen e porosisë' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Gabim në marrjen e porosisë' }, { status: 500 })
  }
}
