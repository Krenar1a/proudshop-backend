import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest) {
  return NextResponse.json({ error: 'Deprecated route. Use /api/admin/categories instead.' }, { status: 410 })
}

export async function POST(_: NextRequest) {
  return NextResponse.json({ error: 'Deprecated route. Use /api/admin/categories instead.' }, { status: 410 })
}
