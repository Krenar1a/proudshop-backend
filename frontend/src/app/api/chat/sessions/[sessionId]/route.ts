import { NextRequest, NextResponse } from 'next/server'

const store: { sessions?: Record<string, any> } = globalThis as any

export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const session = store.sessions?.[sessionId]
  if (!session) return NextResponse.json({ error: 'Nuk u gjet sesioni' }, { status: 404 })
  return NextResponse.json({ session })
}

export const dynamic = 'force-dynamic'
