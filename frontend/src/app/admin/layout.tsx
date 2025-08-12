'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { toast } from 'react-hot-toast'

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastAuthCheck, setLastAuthCheck] = useState(0)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Don't check auth for login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false)
      setIsAuthenticated(true)
      return
    }

    // Only check auth once per session or when explicitly needed
    if (authChecked && isAuthenticated) {
      setIsLoading(false)
      return
    }

    const checkAuth = async () => {
      const now = Date.now()
      const token = localStorage.getItem('adminToken')
      
      // Cache auth check for 5 minutes to prevent constant API calls
      if (isAuthenticated && (now - lastAuthCheck) < 300000) {
        setIsLoading(false)
        return
      }
      
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        setAuthChecked(true)
        router.push('/admin/login')
        return
      }

      try {
        // Verify token with the server
        console.log('Checking auth with token:', token?.substring(0, 20) + '...')
        console.log('Current window location:', window.location.href)
        const apiUrl = `${window.location.origin}/api/admin/auth/me?_t=${Date.now()}`
        console.log('Making API call to:', apiUrl)
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('Auth response status:', response.status)

        if (response.ok) {
          const userData = await response.json()
          console.log('Auth successful:', userData.admin?.email)
          setIsAuthenticated(true)
          setLastAuthCheck(now)
          setAuthChecked(true)
        } else {
          const errorData = await response.json()
          console.error('Auth failed:', response.status, errorData)
          // Token is invalid, clear it and redirect
          localStorage.removeItem('adminToken')
          setIsAuthenticated(false)
          setAuthChecked(true)
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // On network error, still allow access if token exists and we haven't checked before
        if (token && !authChecked) {
          console.log('Network error, but allowing access with existing token')
          setIsAuthenticated(true)
          setLastAuthCheck(now)
          setAuthChecked(true)
        } else {
          console.log('Network error, redirecting to login')
          setIsAuthenticated(false)
          setAuthChecked(true)
          router.push('/admin/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, isLoginPage, authChecked, isAuthenticated, lastAuthCheck])

  // Listen for token changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminToken') {
        if (!e.newValue) {
          // Token was removed
          setIsAuthenticated(false)
          setAuthChecked(false)
          router.push('/admin/login')
        } else {
          // Token was added/changed
          setAuthChecked(false) // Force re-check
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Po ngarkojmë...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && !isLoginPage) {
    return null // Router will redirect
  }

  return <>{children}</>
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    // Login page doesn't need sidebar/header
    return <AdminAuthGuard>{children}</AdminAuthGuard>
  }

  return (
    <AdminAuthGuard>
      <div className="admin-page min-h-screen bg-white text-gray-900">
        <AdminSidebar />
        <div className="lg:pl-64 bg-white">
          <AdminHeader />
          <main className="p-6 bg-white text-gray-900">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  )
}
