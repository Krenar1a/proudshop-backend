import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest) {
  return NextResponse.json({ error: 'Facebook Ads endpoints are disabled. Migrate to backend.' }, { status: 501 })
}

export async function POST(_: NextRequest) {
  return NextResponse.json({ error: 'Facebook Ads endpoints are disabled. Migrate to backend.' }, { status: 501 })
}
