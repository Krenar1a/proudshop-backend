import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const result = await backendCall(request, '/auth/me', { method: 'PUT', body: JSON.stringify(body) })
  if (!result.ok) return NextResponse.json({ error: 'Update failed' }, { status: result.status || 400 })
  const resp = NextResponse.json({ success: true, admin: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
