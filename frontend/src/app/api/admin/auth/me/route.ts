import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

export async function GET(request: NextRequest) {
  const result = await backendCall(request, '/auth/me')
  if (!result.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const resp = NextResponse.json({ success: true, admin: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
