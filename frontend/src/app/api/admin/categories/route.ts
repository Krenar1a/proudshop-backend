import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

// GET - Merr të gjitha kategoritë për admin
export async function GET(request: NextRequest) {
  const result = await backendCall(request, '/categories/')
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, categories: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

// POST - Krijo kategori të re
export async function POST(request: NextRequest) {
  const { name, slug } = await request.json()
  if (!name || !slug) return NextResponse.json({ error: 'Category name and slug required' }, { status: 400 })
  const result = await backendCall(request, '/categories/', { method: 'POST', body: { name, slug } })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, category: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
