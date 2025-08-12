import { NextResponse } from 'next/server'
import { authClient } from '@/lib/authClient'

export async function GET() {
  try {
    // Attempt to register a default admin via backend register endpoint
    const email = process.env.ADMIN_EMAIL || 'admin@proudshop.com'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const name = 'Super Admin'
    // Use public register (no auth required) from backend
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ success: false, error: text || 'Failed to setup admin user' }, { status: res.status })
    }
    const data = await res.json()
    // If tokens returned, set them in authClient for subsequent admin calls in this process
    authClient.setTokens(data.access_token, data.refresh_token)
    return NextResponse.json({ success: true, message: 'Admin user ensured via backend', tokens: { access: data.access_token } })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ success: false, error: 'Failed to setup admin user' }, { status: 500 })
  }
}