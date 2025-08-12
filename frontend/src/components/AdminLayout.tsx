'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check')
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // NOTE: Removed broken /admin/reports link (page does not exist) and
  // added Marketing + API Settings quick access. Keep settings (general) page.
  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Porositë', href: '/admin/orders', icon: '📦' },
    { label: 'Produktet', href: '/admin/products', icon: '🛍️' },
  { label: 'AI Produkt', href: '/admin/products/ai-assistant', icon: '🤖' },
    { label: 'Kategoritë', href: '/admin/categories', icon: '📁' },
    { label: 'Klientët', href: '/admin/customers', icon: '👥' },
    { label: 'Marketing', href: '/admin/marketing/ai-emails', icon: '💌' },
    { label: 'API Settings', href: '/admin/api-settings', icon: '�' },
    { label: 'Cilësimet', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-purple-600 to-cyan-600">
          <h1 className="text-xl font-bold text-white">ProudShop Admin</h1>
        </div>
        
        <nav className="mt-5 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1"
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-900"
          >
            <span className="mr-3 text-lg">🚪</span>
            Dil
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-all duration-300`}>
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-600 lg:hidden"
            >
              <span className="text-2xl">☰</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                🌐 Shiko faqen
              </Link>
              <div className="text-sm text-gray-600">
                👤 Admin
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}
