import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const res = await fetch(`${api}/stats/`, { headers: { Authorization: authHeader } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Gabim në marrjen e statistikave' }, { status: res.status })
    }
    const raw = await res.json()
    const counts = raw?.counts || {}
    const overview = {
      totalOrders: Number(counts.orders ?? 0) || 0,
      totalProducts: Number(counts.products ?? 0) || 0,
      totalCategories: Number(counts.categories ?? 0) || 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    }
    const nowIso = new Date().toISOString()
    const recentOrders = Array.isArray(raw?.recentOrders)
      ? raw.recentOrders.map((o: any) => ({
          id: String(o?.id ?? o ?? ''),
          customerName: o?.customerName ?? '—',
          total: Number(o?.total ?? 0) || 0,
          status: (o?.status ?? 'pending') as string,
          createdAt: o?.createdAt ?? nowIso,
          itemsCount: Number(o?.itemsCount ?? 0) || 0,
        }))
      : []
    const payload = {
      overview,
      recentOrders,
      lowStockProducts: [],
      topCategories: [],
      dailySales: [],
    }
    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json({ error: 'Gabim në marrjen e statistikave' }, { status: 500 })
  }
}
