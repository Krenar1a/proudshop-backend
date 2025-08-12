import { NextRequest, NextResponse } from 'next/server'

// Disabled: Facebook Ads permissions are managed in the backend now.
export async function GET(_: NextRequest) {
  return NextResponse.json({ error: 'Endpoint disabled. Migrate to backend.' }, { status: 501 })
}

export async function PUT(_: NextRequest) {
  return NextResponse.json({ error: 'Endpoint disabled. Migrate to backend.' }, { status: 501 })
}
