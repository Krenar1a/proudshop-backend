import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

type Tokens = { access_token: string; refresh_token: string }

function getTokensFromRequest(req: NextRequest) {
  const access = req.cookies.get('access-token')?.value || null
  const refresh = req.cookies.get('refresh-token')?.value || null
  return { access, refresh }
}

async function doFetch(path: string, init: RequestInit, accessToken?: string) {
  const headers = new Headers(init.headers || {})
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  return fetch(`${API_BASE}${path}`, { ...init, headers })
}

export async function backendCall(
  req: NextRequest,
  path: string,
  init: any = {}
): Promise<{ ok: boolean; status: number; data: any; newTokens?: Tokens }> {
  const { access, refresh } = getTokensFromRequest(req)

  // Normalize body: if body is an object, stringify
  const body = (init as any).body
  if (body && typeof body === 'object' && !(body instanceof Uint8Array)) {
    init = { ...init, body: JSON.stringify(body) }
  }

  let res = await doFetch(path, init, access || undefined)
  if (res.status === 401 && refresh) {
    // try refresh
    const r = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh })
    })
    if (r.ok) {
      const t: Tokens = await r.json()
      res = await doFetch(path, init, t.access_token)
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok, status: res.status, data, newTokens: t }
    }
  }
  const data = await res.json().catch(async () => {
    try { return await res.text() } catch { return null }
  })
  return { ok: res.ok, status: res.status, data }
}

export function applyTokensToResponse(resp: NextResponse, tokens: Tokens) {
  // Mirror cookie options from login route
  const secure = process.env.NODE_ENV === 'production'
  resp.cookies.set('access-token', tokens.access_token, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: 60 * 60
  })
  resp.cookies.set('refresh-token', tokens.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 14
  })
}
