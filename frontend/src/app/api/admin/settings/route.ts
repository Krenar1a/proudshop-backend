import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

function categorize(key: string): string {
  const k = key.toLowerCase()
  if (k.startsWith('smtp_') || k.startsWith('email_')) return 'smtp'
  if (k.startsWith('stripe_')) return 'stripe'
  if (k.startsWith('facebook_')) return 'facebook'
  if (k.startsWith('openai_') || k === 'openai_api_key') return 'openai'
  // Also support uppercase OPENAI_API_KEY
  if (key === 'OPENAI_API_KEY') return 'openai'
  if (k.startsWith('site_') || k === 'admin_email' || k === 'maintenance_mode') return 'system'
  return 'system'
}

// GET all settings
export async function GET(request: NextRequest) {
  const result = await backendCall(request, '/settings/')
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const raw = (result.data as any[]) || []
  const mapped = raw.map(s => ({
    key: s.key,
    value: s.value,
    category: categorize(String(s.key || '')),
    description: null,
    isEncrypted: false,
    updatedAt: new Date().toISOString(),
  }))
  const resp = NextResponse.json({ settings: mapped })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

// Create/update a setting (upsert)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await backendCall(request, '/settings/', { method: 'POST', body })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const s: any = result.data
  const mapped = {
    key: s.key,
    value: s.value,
    category: categorize(String(s.key || '')),
    description: null,
    isEncrypted: false,
    updatedAt: new Date().toISOString(),
  }
  const resp = NextResponse.json({ success: true, setting: mapped })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

// Alias PUT to POST (upsert behavior)
export async function PUT(request: NextRequest) {
  return POST(request)
}

// No delete endpoint implemented in backend; return 405
export async function DELETE() {
  return NextResponse.json({ error: 'Deleting settings not supported' }, { status: 405 })
}
