'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, Users, ShoppingCart, Package, DollarSign } from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')

  const statsCards = [
    {
      title: 'Shitjet e përgjithshme',
      value: '€45,231',
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Porositë',
      value: '1,234',
      change: '+5%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Klientë të rinj',
      value: '156',
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Produktet më të shitura',
      value: '89',
      change: '-2%',
      trend: 'down',
      icon: Package,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitikat</h1>
          <p className="text-gray-600">Shiko performancën e dyqanit</p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">7 ditët e fundit</option>
          <option value="30d">30 ditët e fundit</option>
          <option value="90d">90 ditët e fundit</option>
          <option value="1y">1 vit</option>
        </select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp size={16} className="text-green-500 mr-1" />
                    ) : (
                      <TrendingUp size={16} className="text-red-500 mr-1 rotate-180" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">nga java e kaluar</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Shitjet mujore</h3>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Grafiku i shitjeve do të implementohet së shpejti</p>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Produktet më të shitura</h3>
          <div className="space-y-4">
            {[
              { name: 'Laptop Gaming Pro', sales: 245, revenue: '€12,250' },
              { name: 'Telefon Smartphone X', sales: 189, revenue: '€9,450' },
              { name: 'Kamerë DSLR Pro', sales: 156, revenue: '€7,800' },
              { name: 'Headphones Wireless', sales: 134, revenue: '€6,700' },
              { name: 'Tablet Ultra Slim', sales: 98, revenue: '€4,900' }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} shitje</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic sources */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Burimet e trafikut</h3>
          <div className="space-y-4">
            {[
              { source: 'Google Search', percentage: 45, color: 'bg-blue-500' },
              { source: 'Facebook Ads', percentage: 28, color: 'bg-blue-600' },
              { source: 'Direct', percentage: 15, color: 'bg-green-500' },
              { source: 'Instagram', percentage: 12, color: 'bg-pink-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700">{item.source}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Aktiviteti i fundit</h3>
          <div className="space-y-4">
            {[
              { action: 'Porosi e re', time: '2 min më parë', type: 'order' },
              { action: 'Produkt i ri shtuar', time: '1 orë më parë', type: 'product' },
              { action: 'Klient i ri regjistruar', time: '3 orë më parë', type: 'user' },
              { action: 'Porosi e dorëzuar', time: '5 orë më parë', type: 'delivery' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistika të shpejta</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Konvertimi</span>
              <span className="text-sm font-medium text-gray-900">3.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vlera mesatare e porosisë</span>
              <span className="text-sm font-medium text-gray-900">€127</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Klientë që kthehen</span>
              <span className="text-sm font-medium text-gray-900">68%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Koha mesatare në faqe</span>
              <span className="text-sm font-medium text-gray-900">2m 34s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
