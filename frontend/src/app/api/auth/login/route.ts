import { NextRequest, NextResponse } from 'next/server'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await r.json()
  if (!r.ok) {
    return NextResponse.json({ error: data.detail || 'Login failed' }, { status: r.status })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin-token', data.access_token, { httpOnly: true, sameSite: 'lax', path: '/' })
  res.cookies.set('refresh-token', data.refresh_token, { httpOnly: true, sameSite: 'lax', path: '/' })
  return res
}
