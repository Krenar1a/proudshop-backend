'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Eye,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DashboardStats {
  overview: {
    totalOrders: number
    totalProducts: number
    totalCategories: number
    pendingOrders: number
    completedOrders: number
    totalRevenue: number
  }
  recentOrders: Array<{
    id: string
    customerName: string
    total: number
    status: string
    createdAt: string
    itemsCount: number
  }>
  lowStockProducts: Array<{
    id: string
    name: string
    stock: number
    category: { name: string }
  }>
  topCategories: Array<{
    id: string
    name: string
    productsCount: number
  }>
  dailySales: Array<{
    date: string
    orders: number
    revenue: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    overview: {
      totalOrders: 0,
      totalProducts: 0,
      totalCategories: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0
    },
    recentOrders: [],
    lowStockProducts: [],
    topCategories: [],
    dailySales: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/stats?timeRange=${selectedTimeRange}`)
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        toast.error('Gabim në marrjen e statistikave')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Gabim në server')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [selectedTimeRange])

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color,
    prefix = '',
    suffix = '',
    isLoading = false
  }: {
    title: string
    value: number | string
    change?: number
    icon: React.ComponentType<{ size?: number, className?: string }>
    color: string
    prefix?: string
    suffix?: string
    isLoading?: boolean
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {isLoading ? (
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      {change !== undefined && !isLoading && (
        <div className="mt-4 flex items-center">
          {change > 0 ? (
            <ArrowUp size={16} className="text-green-500 mr-1" />
          ) : (
            <ArrowDown size={16} className="text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">nga java e kaluar</span>
        </div>
      )}
    </div>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Në pritje'
      case 'processing': return 'Duke u procesuar'
      case 'shipped': return 'E dërguar'
      case 'delivered': return 'E dorëzuar'
      case 'cancelled': return 'E anuluar'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Mirë se erdhët në panelin e admin</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="7d">7 ditët e fundit</option>
                <option value="30d">30 ditët e fundit</option>
                <option value="90d">90 ditët e fundit</option>
              </select>
              
              <button 
                onClick={fetchStats}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Rifresko
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Porosite gjithsej"
            value={stats.overview.totalOrders}
            change={15}
            icon={ShoppingCart}
            color="bg-blue-500"
            isLoading={isLoading}
          />
          
          <StatCard 
            title="Produktet gjithsej"
            value={stats.overview.totalProducts}
            change={8}
            icon={Package}
            color="bg-green-500"
            isLoading={isLoading}
          />
          
          <StatCard 
            title="Kategoritë gjithsej"
            value={stats.overview.totalCategories}
            change={0}
            icon={Users}
            color="bg-purple-500"
            isLoading={isLoading}
          />
          
          <StatCard 
            title="Të ardhurat gjithsej"
            value={stats.overview.totalRevenue}
            change={12}
            icon={DollarSign}
            color="bg-yellow-500"
            prefix="€"
            isLoading={isLoading}
          />
        </div>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Porosite e fundit</h3>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="bg-gray-200 animate-pulse h-16 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 text-sm">
                        <th className="pb-3">Klienti</th>
                        <th className="pb-3">Shuma</th>
                        <th className="pb-3">Statusi</th>
                        <th className="pb-3">Data</th>
                        <th className="pb-3">Veprimet</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {stats.recentOrders.length > 0 ? (
                        stats.recentOrders.map((order) => (
                          <tr key={order.id} className="border-t border-gray-100">
                            <td className="py-3">
                              <div>
                                <p className="font-medium text-gray-900">{order.customerName}</p>
                                <p className="text-sm text-gray-500">{order.itemsCount} produkte</p>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="font-medium text-gray-900">€{order.total.toFixed(2)}</span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="py-3 text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('sq-AL')}
                            </td>
                            <td className="py-3">
                              <button className="text-blue-500 hover:text-blue-700 text-sm">
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            Nuk ka porosi të regjistruara
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle size={20} className="text-orange-500 mr-2" />
                Stoku i ulët
              </h3>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-gray-200 animate-pulse h-12 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.lowStockProducts.length > 0 ? (
                    stats.lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.category.name}</p>
                        </div>
                        <span className="text-orange-600 font-bold text-sm">{product.stock}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">
                      Të gjitha produktet kanë stok të mjaftueshëm
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Kategoritë më të popullarizuara</h3>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-200 animate-pulse h-20 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.topCategories.length > 0 ? (
                  stats.topCategories.map((category, index) => (
                    <div key={category.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-600">{category.productsCount} produkte</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-500">Nuk ka të dhëna për kategoritë</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
