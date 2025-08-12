import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Dolët me sukses' })
  
  // Clear backend auth cookies
  response.cookies.delete('access-token')
  response.cookies.delete('refresh-token')
  
  return response
}
