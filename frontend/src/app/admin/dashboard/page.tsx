"use client";

// This file previously duplicated the main /admin dashboard logic.
// Keep a minimal component that redirects or links to the canonical dashboard (/admin).
// This avoids diverging implementations.
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardRedirect() {
  useEffect(() => {
    // Client-side redirect for users hitting /admin/dashboard directly.
    if (typeof window !== 'undefined') {
      window.location.replace('/admin')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-gray-600 mb-4">Duke ridrejtuar në dashboard…</p>
        <Link href="/admin" className="text-blue-600 hover:underline">Shko tek Dashboard</Link>
      </div>
    </div>
  )
}
