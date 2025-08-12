import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  context: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = context.params

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Numri i porosisë është i detyrueshëm' },
        { status: 400 }
      )
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const res = await fetch(`${apiBase}/orders/by-number/${orderNumber}`)
    if (res.status === 404) return NextResponse.json({ error: 'Porosia nuk u gjet' }, { status: 404 })
    if (!res.ok) return NextResponse.json({ error: 'Gabim në server' }, { status: res.status })

    const raw = await res.json()
    if (raw && typeof raw === 'object' && 'error' in raw) {
      return NextResponse.json({ error: 'Porosia nuk u gjet' }, { status: 404 })
    }

    // Normalize backend payload to UI-friendly contract used by order-success page
    const normalized = {
      id: String(raw.id ?? ''),
      orderNumber: String(raw.order_number ?? orderNumber),
      total: Number(raw.total_eur ?? 0),
      subtotal: Number(raw.total_eur ?? 0),
      shipping: 0,
      tax: 0,
      currency: '€',
      status: String(raw.status ?? 'PENDING'),
      paymentStatus: 'PENDING',
      shippingName: '',
      shippingEmail: '',
      shippingPhone: '',
      shippingAddress: '',
      shippingCity: '',
      shippingZip: '',
      shippingCountry: '',
      createdAt: raw.created_at ? String(raw.created_at) : undefined,
      orderItems: Array.isArray(raw.items)
        ? raw.items.map((it: any) => {
            const price = Number(it.price_eur ?? 0)
            const qty = Number(it.quantity ?? 0)
            return {
              id: String(it.id ?? ''),
              quantity: qty,
              price,
              total: Number((price * qty) || 0),
              product: {
                name: `Produkti #${it.product_id ?? ''}`,
                image: null as string | null,
              },
            }
          })
        : [],
    }

    return NextResponse.json({ success: true, order: normalized })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Gabim në server' },
      { status: 500 }
    )
  }
}
