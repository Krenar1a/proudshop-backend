'use client'

import { useState } from 'react'
import { TrendingUp, DollarSign, Calendar, Download, BarChart3 } from 'lucide-react'

export default function SalesAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [viewType, setViewType] = useState('chart')

  const salesData = [
    { date: '2024-01-01', sales: 1250, orders: 25 },
    { date: '2024-01-02', sales: 980, orders: 18 },
    { date: '2024-01-03', sales: 1450, orders: 32 },
    { date: '2024-01-04', sales: 2100, orders: 41 },
    { date: '2024-01-05', sales: 1800, orders: 35 },
    { date: '2024-01-06', sales: 2250, orders: 48 },
    { date: '2024-01-07', sales: 1950, orders: 39 }
  ]

  const totalSales = salesData.reduce((acc, day) => acc + day.sales, 0)
  const totalOrders = salesData.reduce((acc, day) => acc + day.orders, 0)
  const avgOrderValue = totalSales / totalOrders

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitikat e Shitjeve</h1>
          <p className="text-gray-600">Analizo performancën e shitjeve</p>
        </div>
        <div className="flex items-center space-x-4">
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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download size={20} />
            <span>Eksporto</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shitjet totale</p>
              <p className="text-2xl font-bold text-gray-900">€{totalSales.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">+12%</span>
              </div>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Porositë totale</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              <div className="flex items-center mt-2">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">+8%</span>
              </div>
            </div>
            <BarChart3 className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vlera mesatare</p>
              <p className="text-2xl font-bold text-gray-900">€{avgOrderValue.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">+3%</span>
              </div>
            </div>
            <DollarSign className="text-purple-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rritja ditore</p>
              <p className="text-2xl font-bold text-gray-900">€156</p>
              <div className="flex items-center mt-2">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">+15%</span>
              </div>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Trendi i Shitjeve</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewType('chart')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewType === 'chart' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Grafiku
              </button>
              <button
                onClick={() => setViewType('table')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewType === 'table' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tabela
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {viewType === 'chart' ? (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Grafiku i shitjeve do të implementohet së shpejti</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shitjet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porositë</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mesatarja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salesData.map((day, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(day.date).toLocaleDateString('sq-AL')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        €{day.sales.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{day.orders}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        €{(day.sales / day.orders).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top Categories by Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Kategoritë më të shitura</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Teknologji', sales: 15250, percentage: 45 },
                { name: 'Kuzhinë', sales: 8900, percentage: 26 },
                { name: 'Bukuri', sales: 6200, percentage: 18 },
                { name: 'Sport', sales: 3650, percentage: 11 }
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded" style={{
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}></div>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">€{category.sales.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{category.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performanca mujore</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { month: 'Janar', sales: 34200, growth: 12 },
                { month: 'Shkurt', sales: 29800, growth: -8 },
                { month: 'Mars', sales: 41500, growth: 18 },
                { month: 'Prill', sales: 38900, growth: 5 }
              ].map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{month.month}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">€{month.sales.toLocaleString()}</span>
                    <span className={`text-xs font-medium ${
                      month.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {month.growth > 0 ? '+' : ''}{month.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
