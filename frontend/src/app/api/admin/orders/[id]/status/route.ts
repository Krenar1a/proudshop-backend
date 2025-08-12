import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'
// Email notifications now handled by backend.

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status } = body
  if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 })
  const result = await backendCall(request, `/orders/${id}/status`, { method: 'PUT', body: { status } })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  // Backend already sends status update emails.
  const resp = NextResponse.json({ success: true, order: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
