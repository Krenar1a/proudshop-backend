import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

// GET specific admin
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const result = await backendCall(request, `/admins/${params.id}`)
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ admin: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

// PUT - Update admin
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const { name, email, role, password } = await request.json()
  const result = await backendCall(request, `/admins/${params.id}`, { method: 'PUT', body: { name, email, role, password } })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, admin: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

// DELETE admin
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const result = await backendCall(request, `/admins/${params.id}`, { method: 'DELETE' })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, message: 'Admin u fshi me sukses' })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
