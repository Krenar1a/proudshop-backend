import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

// GET all admins
export async function GET(request: NextRequest) {
  const result = await backendCall(request, '/admins/')
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ admins: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

// POST - Create new admin
export async function POST(request: NextRequest) {
  const { name, email, password, role } = await request.json()
  const result = await backendCall(request, '/admins/', { method: 'POST', body: { name, email, password, role } })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, admin: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
