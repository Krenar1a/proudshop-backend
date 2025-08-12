import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const limit = searchParams.get('limit') || '8'
		const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
		const res = await fetch(`${backend}/products?offers=true&limit=${limit}`)
		if (!res.ok) {
			return NextResponse.json({ products: [] })
		}
		const data = await res.json()
		return NextResponse.json(data)
	} catch (e) {
		console.error('Offers products error', e)
		return NextResponse.json({ products: [] }, { status: 500 })
	}
}
