import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

export async function GET(request: NextRequest) {
  const result = await backendCall(request, '/openai/key')
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json(result.data)
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await backendCall(request, '/openai/key', { method: 'POST', body })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json(result.data)
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
