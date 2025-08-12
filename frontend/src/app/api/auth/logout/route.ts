import { NextRequest, NextResponse } from 'next/server'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function POST(req: NextRequest) {
  const refresh = req.cookies.get('refresh-token')?.value
  if (refresh) {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh })
    })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin-token', '', { httpOnly: true, expires: new Date(0), path: '/' })
  res.cookies.set('refresh-token', '', { httpOnly: true, expires: new Date(0), path: '/' })
  return res
}
