'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  Mail, 
  UserCheck,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'VIEW_ANALYTICS'
  },
  {
    title: 'Produktet',
    icon: Package,
    permission: 'MANAGE_PRODUCTS',
    children: [
      { title: 'Të Gjitha Produktet', href: '/admin/products' },
      { title: 'Shto Produkt', href: '/admin/products/new' },
  { title: 'AI Produkt', href: '/admin/products/ai-assistant' },
      { title: 'Kategoritë', href: '/admin/categories' },
      { title: 'Recensionet', href: '/admin/reviews' }
    ]
  },
  {
    title: 'Porositë',
    icon: ShoppingCart,
    permission: 'VIEW_ORDERS',
    children: [
      { title: 'Të Gjitha Porositë', href: '/admin/orders' },
      { title: 'Porosi të Reja', href: '/admin/orders?status=pending' },
      { title: 'Në Proces', href: '/admin/orders?status=processing' },
      { title: 'Të Dërguara', href: '/admin/orders?status=shipped' }
    ]
  },
  {
    title: 'Klientët',
    href: '/admin/customers',
    icon: Users,
    permission: 'MANAGE_USERS'
  },
  {
    title: 'Analitikat',
    icon: BarChart3,
    permission: 'VIEW_ANALYTICS',
    children: [
      { title: 'Dashboard', href: '/admin/analytics' },
      { title: 'Shitjet', href: '/admin/analytics/sales' },
      { title: 'Produktet', href: '/admin/analytics/products' },
      { title: 'Klientët', href: '/admin/analytics/customers' }
    ]
  },
  {
    title: 'Marketing',
    icon: Mail,
    permission: 'MANAGE_MARKETING',
    children: [
      { title: 'Email Campaigns', href: '/admin/marketing/emails' },
      { title: 'AI Email Generator', href: '/admin/marketing/ai-emails' },
      { title: 'Newsletter', href: '/admin/marketing/newsletter' },
      { title: 'Facebook Ads', href: '/admin/marketing/facebook-ads' },
      { title: 'AI Marketing', href: '/admin/marketing/ai' }
    ]
  },
  {
    title: 'Chat Support',
    href: '/admin/chat',
    icon: MessageSquare,
    permission: 'MANAGE_CHAT'
  },
  {
    title: 'Adminat',
    href: '/admin/admins',
    icon: UserCheck,
    permission: 'MANAGE_ADMINS'
  },
  {
    title: 'Cilësimet',
    icon: Settings,
    permission: 'MANAGE_SETTINGS',
    children: [
      { title: 'Cilësimet e Përgjithshme', href: '/admin/settings' },
      { title: 'API Settings', href: '/admin/api-settings' }
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Produktet', 'Porositë'])

  // Mock admin permissions - in real app, get from auth context
  const adminPermissions = [
    'MANAGE_USERS',
    'MANAGE_PRODUCTS',
    'MANAGE_ORDERS',
    'MANAGE_ANALYTICS',
    'MANAGE_SETTINGS',
    'MANAGE_ADMINS',
    'MANAGE_MARKETING',
    'MANAGE_CHAT',
    'VIEW_ANALYTICS',
    'VIEW_ORDERS',
    'VIEW_PRODUCTS'
  ]

  const hasPermission = (permission: string) => {
    return adminPermissions.includes(permission)
  }

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white text-gray-900 z-50 lg:translate-x-0 transform -translate-x-full transition-transform border-r border-gray-200 shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-white">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xl px-3 py-2 rounded-lg">
            Proudshop
          </div>
          <span className="text-sm opacity-75">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            if (!hasPermission(item.permission || '')) {
              return null
            }

            if (item.children) {
              const isExpanded = expandedMenus.includes(item.title)
              const hasActiveChild = item.children.some(child => isActive(child.href))

              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                      hasActiveChild ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon size={20} className="mr-3" />
                      <span>{item.title}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                            isActive(child.href)
                              ? 'bg-pink-500 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href || '#'}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href || '')
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
