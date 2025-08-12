import { NextRequest, NextResponse } from 'next/server'

export async function POST(_: NextRequest) {
  return NextResponse.json({ error: 'AI endpoints handled by backend now.' }, { status: 501 })
}
