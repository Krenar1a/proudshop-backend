import { NextResponse } from 'next/server'

interface CategoryWithProducts {
  id: string
  name: string
  nameEn?: string
  nameSq?: string
  description?: string
  image?: string
  slug: string
  products: { id: string }[]
}

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/categories/`)
    if (!res.ok) return NextResponse.json({ error: 'Gabim në marrjen e kategorive' }, { status: res.status })
    const data = await res.json()
    // data is list; wrap to previous shape
    return NextResponse.json({ categories: data.map((c: any) => ({ ...c, productCount: c.productCount || 0 })) })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Gabim në marrjen e kategorive' }, { status: 500 })
  }
}
