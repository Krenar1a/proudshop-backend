import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await backendCall(request, '/products/ai/scrape-facebook-page', { method: 'POST', body: JSON.stringify(body) })
  if (!result.ok) return NextResponse.json({ error: 'Scrape page dështoi', detail: result.data?.detail }, { status: result.status || 500 })
  const resp = NextResponse.json(result.data)
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
