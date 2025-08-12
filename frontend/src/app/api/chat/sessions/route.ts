import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

interface ChatMessage { id: string; message: string; sender: 'user'|'admin'|'system'; timestamp: string; senderName: string }
interface ChatSession { id: string; userName: string; userEmail: string; status: 'active'|'waiting'|'closed'; messages: ChatMessage[]; createdAt: string }

// Simple in-memory store (reset on server restart)
const store: { sessions: Record<string, ChatSession> } = globalThis as any
if (!store.sessions) store.sessions = {}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const userName = (body.userName || '').toString().trim().slice(0,100)
  const userEmail = (body.userEmail || '').toString().trim().toLowerCase().slice(0,160)
  if (!userName || !userEmail) {
    return NextResponse.json({ error: 'Emri dhe email kërkohen' }, { status: 400 })
  }
  const id = randomUUID()
  const session: ChatSession = {
    id,
    userName,
    userEmail,
    status: 'active',
    createdAt: new Date().toISOString(),
    messages: [ { id: randomUUID(), message: 'Chat u krijua', sender: 'system', timestamp: new Date().toISOString(), senderName: 'system' } ]
  }
  store.sessions[id] = session
  return NextResponse.json({ session })
}

export async function GET() {
  const sessions = Object.values(store.sessions).map(s => ({ id: s.id, userName: s.userName, userEmail: s.userEmail, status: s.status, createdAt: s.createdAt, lastMessageAt: s.messages[s.messages.length-1]?.timestamp }))
  return NextResponse.json({ sessions })
}

export const dynamic = 'force-dynamic'
