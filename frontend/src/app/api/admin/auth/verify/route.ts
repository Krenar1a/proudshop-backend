import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest) {
  return NextResponse.json({ error: 'Moved to backend /auth/me.' }, { status: 501 })
}
