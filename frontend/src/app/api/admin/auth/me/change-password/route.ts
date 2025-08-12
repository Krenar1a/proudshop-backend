import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await backendCall(request, '/auth/me/change-password', { method: 'POST', body: JSON.stringify(body) })
  if (!result.ok) return NextResponse.json({ error: 'Password change failed' }, { status: result.status || 400 })
  const resp = NextResponse.json({ success: true })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
