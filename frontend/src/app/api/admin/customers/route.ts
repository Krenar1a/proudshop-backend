import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

// GET - Get customers with filtering options
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const filter = url.searchParams.get('filter') || 'all'

  const result = await backendCall(request, '/customers/')
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })

  const backend = Array.isArray(result.data) ? result.data : []

  // Normalize to UI-expected shape with safe defaults
  const byEmail = new Map<string, any>()
  const normalized = backend.map((c: any) => {
    const email = String(c.email || '')
    const name = String(c.name || (email ? email.split('@')[0] : 'Klient'))
    const country = c.country || null
    const orderCount = Number(c.order_count ?? 0)
    const totalSpent = Number(c.total_spent ?? 0)
    const lastOrderDate = c.last_order_date || null
    const segment = orderCount > 3 ? 'VIP' : orderCount > 0 ? 'Active' : 'New'
    const entry = { email, name, country, orderCount, totalSpent, lastOrderDate, segment }
    if (email) byEmail.set(email.toLowerCase(), entry)
    return entry
  })

  // Merge customers derived from orders (shipping_*), to capture guest buyers' emails
  const ordersRes = await backendCall(request, '/orders/')
  if (ordersRes.ok && Array.isArray(ordersRes.data)) {
    for (const o of ordersRes.data as any[]) {
      const email = String(o.shipping_email || '')
      if (!email) continue
      const key = email.toLowerCase()
      const name = String(o.shipping_name || (email ? email.split('@')[0] : 'Klient'))
      const createdAt = o.created_at || o.createdAt || null
      const total = Number(o.total_eur ?? o.total ?? 0)
      const existing = byEmail.get(key)
      if (existing) {
        // Aggregate stats
        existing.orderCount = (existing.orderCount || 0) + 1
        existing.totalSpent = Number((existing.totalSpent || 0) + total)
        existing.lastOrderDate = createdAt || existing.lastOrderDate
        existing.segment = existing.orderCount > 3 ? 'VIP' : existing.orderCount > 0 ? 'Active' : 'New'
      } else {
        const entry = {
          email,
          name,
          country: null,
          orderCount: 1,
          totalSpent: total,
          lastOrderDate: createdAt,
          segment: 'Active',
        }
        byEmail.set(key, entry)
        normalized.push(entry)
      }
    }
  }

  // Apply simple filter client-side (backend doesn't support yet)
  const filtered = normalized.filter((cust) => {
    switch (filter) {
      case 'active':
        return cust.orderCount > 0
      case 'frequent':
        return cust.orderCount >= 3
      case 'high_value':
        return cust.totalSpent >= 500 // arbitrary threshold
      case 'new':
        return cust.orderCount === 0
      default:
        return true
    }
  })

  // Build segments summary for admin/customers page
  const segments = {
    total: normalized.length,
    active: normalized.filter(c => c.orderCount > 0).length,
    frequent: normalized.filter(c => c.orderCount >= 3).length,
    highValue: normalized.filter(c => c.totalSpent >= 500).length,
    new: normalized.filter(c => c.orderCount === 0).length,
  }

  const resp = NextResponse.json({ success: true, customers: filtered, totalCustomers: normalized.length, segments })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
