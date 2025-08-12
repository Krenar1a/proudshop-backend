import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

// Proxy to backend email sender; expects body with to/subject/html
export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await backendCall(request, '/emails/send', { method: 'POST', body })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json(result.data)
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST to send notifications' }, { status: 405 })
}
