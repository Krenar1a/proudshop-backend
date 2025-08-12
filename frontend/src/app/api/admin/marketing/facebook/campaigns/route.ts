import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

export async function GET(request: NextRequest) {
  const result = await backendCall(request, '/facebook/campaigns')
  if (!result.ok) return NextResponse.json({ error: 'Failed' }, { status: result.status || 500 })
  const resp = NextResponse.json(result.data)
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await backendCall(request, '/facebook/campaigns', { method: 'POST', body: JSON.stringify(body) })
  if (!result.ok) return NextResponse.json({ error: 'Failed', detail: result.data?.detail }, { status: result.status || 500 })
  const resp = NextResponse.json(result.data)
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
