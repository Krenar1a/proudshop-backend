import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('Get category details API called for category:', id)
  
  const result = await backendCall(request, `/categories/${id}`)
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, category: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('Update category API called for category:', id)
  
  const body = await request.json()
  const { name, slug } = body
  const result = await backendCall(request, `/categories/${id}`, { method: 'PUT', body: { name, slug } })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, category: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('Delete category API called for category:', id)
  
  const result = await backendCall(request, `/categories/${id}`, { method: 'DELETE' })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })
  const resp = NextResponse.json({ success: true, message: 'Category deleted successfully' })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
