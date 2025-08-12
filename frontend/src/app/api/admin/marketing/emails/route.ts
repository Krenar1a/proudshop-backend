import { NextRequest, NextResponse } from 'next/server'
import { backendCall, applyTokensToResponse } from '@/lib/backendProxy'

// Ephemeral in-memory store for campaigns (dev-only convenience)
type Campaign = { id: string; name: string; subject: string; status: 'draft'|'scheduled'|'sent'; recipients: number; createdAt: string; sentDate?: string }
const campaigns: Campaign[] = []

// GET - list email campaigns (ephemeral)
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  // diagnostics passthrough ?check=1
  if (url.searchParams.get('check')) {
    const result = await backendCall(request, '/emails/check', { method: 'GET' })
    return NextResponse.json(result.data, { status: result.status })
  }
  if (url.searchParams.get('authMatrix')) {
    const result = await backendCall(request, '/emails/auth-matrix', { method: 'GET' })
    return NextResponse.json(result.data, { status: result.status })
  }
  return NextResponse.json({ campaigns })
}

// POST - send emails via backend and record a simple campaign entry
export async function POST(request: NextRequest) {
  const body = await request.json()
  // Normalize to backend schema
  const to = Array.isArray(body.to)
    ? body.to
    : Array.isArray(body.recipients)
      ? body.recipients
      : []
  const html = typeof body.html === 'string' ? body.html : String(body.content || '')
  const subject = String(body.subject || 'Marketing Email')
  const from_email = body.from_email
  const from_name = body.from_name

  const payload = { to, subject, html, ...(from_email ? { from_email } : {}), ...(from_name ? { from_name } : {}) }

  const result = await backendCall(request, '/emails/send', { method: 'POST', body: payload })
  if (!result.ok) return NextResponse.json(result.data, { status: result.status })

  try {
    const name = String(body.campaignName || body.name || 'Email Campaign')
    const recipients = Array.isArray(to) ? to.length : 0
    const entry: Campaign = {
      id: `${Date.now()}`,
      name,
      subject,
      status: 'sent',
      recipients,
      createdAt: new Date().toISOString(),
      sentDate: new Date().toISOString(),
    }
    campaigns.unshift(entry)
  } catch {}

  const resp = NextResponse.json({ success: true, message: 'Fushata u dërgua me sukses', result: result.data })
  if (result.newTokens) applyTokensToResponse(resp, result.newTokens)
  return resp
}
