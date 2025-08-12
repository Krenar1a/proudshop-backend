import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const store: { sessions?: Record<string, any> } = globalThis as any

async function notifyAdmin(session: any, msg: any) {
  try {
    const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const to = process.env.ADMIN_NOTIFICATION_EMAIL
    if (!to) return
    const subject = `📩 Chat mesazh i ri: ${session.userName}`
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif">\n<h2>Mesazh i ri në Live Chat</h2>\n<p><strong>Emri:</strong> ${session.userName}<br/><strong>Email:</strong> ${session.userEmail}<br/><strong>Session:</strong> ${session.id}</p>\n<div style="background:#f5f5f5;padding:10px;border-radius:6px;">${msg.message.replace(/</g,'&lt;')}</div>\n<p style="margin-top:15px;font-size:12px;color:#888">ProudShop</p></body></html>`
    await fetch(`${backend}/emails/send`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.ADMIN_SERVICE_TOKEN || ''}` }, body: JSON.stringify({ to: [to], subject, html }) })
  } catch (e) {
    console.error('Admin chat notify failed:', e)
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const session = store.sessions?.[sessionId]
  if (!session) return NextResponse.json({ error: 'Sesioni nuk ekziston' }, { status: 404 })
  const body = await request.json().catch(() => ({}))
  const text = (body.message || '').toString().trim()
  if (!text) return NextResponse.json({ error: 'Mesazhi është bosh' }, { status: 400 })
  const message = { id: randomUUID(), message: text.slice(0, 2000), sender: 'user', senderName: session.userName, timestamp: new Date().toISOString() }
  session.messages.push(message)
  // Fire-and-forget admin notification
  notifyAdmin(session, message)
  return NextResponse.json({ message })
}

export const dynamic = 'force-dynamic'
