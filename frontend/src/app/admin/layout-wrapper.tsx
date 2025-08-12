'use client'

import { useState } from 'react'
import { BarChart3, Package, ShoppingCart, Users, Settings, Home } from 'lucide-react'
import AdminDashboard from './dashboard/page'

const navigation = [
  { name: 'Dashboard', href: '#dashboard', icon: BarChart3, current: true },
  { name: 'Produktet', href: '#products', icon: Package, current: false },
  { name: 'Porositë', href: '#orders', icon: ShoppingCart, current: false },
  { name: 'Përdoruesit', href: '#users', icon: Users, current: false },
  { name: 'Rregullimet', href: '#settings', icon: Settings, current: false },
]

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />
      case 'products':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Produktet</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Menaxhimi i produkteve do të implementohet së shpejti.</p>
            </div>
          </div>
        )
      case 'orders':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Porositë</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Menaxhimi i porosive do të implementohet së shpejti.</p>
            </div>
          </div>
        )
      case 'users':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Përdoruesit</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Menaxhimi i përdoruesve do të implementohet së shpejti.</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Rregullimet</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Rregullimet do të implementohen së shpejti.</p>
            </div>
          </div>
        )
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="admin-layout min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <Home className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.href.replace('#', ''))}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.href.replace('#', '')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">admin@proudshop.com</span>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                Dilni
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
          >
            {navigation.map((item) => (
              <option key={item.name} value={item.href.replace('#', '')}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <main className="bg-gray-50 min-h-screen">
        {renderContent()}
      </main>
    </div>
  )
}
