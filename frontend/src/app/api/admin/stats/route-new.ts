import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest) {
  return NextResponse.json({ error: 'Deprecated. Use /api/admin/stats' }, { status: 410 })
}
