import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/categories/slug/${slug}`)
    if (res.status === 404) {
      return NextResponse.json({ error: 'Kategoria nuk u gjet' }, { status: 404 })
    }
    if (!res.ok) return NextResponse.json({ error: 'Gabim në server' }, { status: res.status })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Category fetch error:', error)
    return NextResponse.json({ 
      error: 'Gabim në server' 
    }, { status: 500 })
  }
}
