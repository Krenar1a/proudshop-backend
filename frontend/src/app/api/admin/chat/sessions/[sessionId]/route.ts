import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const result = await backendCall(request, `/chat/sessions/${params.sessionId}`)
  if (!result.ok) return NextResponse.json({ error: 'Failed' }, { status: result.status || 500 })
  const resp = NextResponse.json(result.data)
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const body = await request.json()
  const result = await backendCall(request, `/chat/sessions/${params.sessionId}/messages`, { method: 'POST', body: JSON.stringify(body) })
  if (!result.ok) return NextResponse.json({ error: 'Failed' }, { status: result.status || 500 })
  const resp = NextResponse.json(result.data)
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

export async function PUT() { return NextResponse.json({ error: 'Not implemented' }, { status: 405 }) }
