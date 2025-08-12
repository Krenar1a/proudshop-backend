'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Package, Eye, Search, Filter, Clock, CheckCircle, Truck, X, AlertCircle, Calendar, DollarSign, User, Phone, Mail, MapPin, Edit2, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  total: number
  product: {
    name: string
    images?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  shippingEmail: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingZip: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  itemsCount: number
  orderItems?: OrderItem[]
  notes?: string
  trackingNumber?: string
  subtotal: number
  shipping: number
  tax: number
}

const ORDER_STATUSES = {
  PENDING: { label: 'Në pritje', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { label: 'Konfirmuar', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  PROCESSING: { label: 'Në proces', color: 'bg-purple-100 text-purple-800', icon: Package },
  SHIPPED: { label: 'Dërguar', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  DELIVERED: { label: 'Dorëzuar', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Anuluar', color: 'bg-red-100 text-red-800', icon: X },
}

const PAYMENT_STATUSES = {
  PENDING: { label: 'Në pritje', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Paguar', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Dështuar', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Rimbursuar', color: 'bg-gray-100 text-gray-800' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else if (response.status === 401) {
        toast.error('Duhet të bëni login si admin')
        window.location.href = '/admin/login'
      } else {
        toast.error('Gabim në ngarkimin e porosive')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Gabim në ngarkimin e porosive')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedOrder(data.order)
        setShowOrderDetails(true)
      } else {
        toast.error('Gabim në ngarkimin e detajeve të porosisë')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Gabim në ngarkimin e detajeve të porosisë')
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Statusi u përditësua me sukses')
        fetchOrders()
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      } else {
        toast.error('Gabim në përditësimin e statusit')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Gabim në përditësimin e statusit')
    }
  }

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.shippingEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || order.status === statusFilter
      const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter
      
      if (dateFilter) {
        const orderDate = new Date(order.createdAt)
        const today = new Date()
        const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (dateFilter) {
          case 'today':
            if (daysDiff !== 0) return false
            break
          case 'week':
            if (daysDiff > 7) return false
            break
          case 'month':
            if (daysDiff > 30) return false
            break
        }
      }
      
      return matchesSearch && matchesStatus && matchesPayment
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'amount-high':
          return b.total - a.total
        case 'amount-low':
          return a.total - b.total
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  const newOrdersCount = orders.filter(o => o.status === 'PENDING').length
  const processingOrdersCount = orders.filter(o => o.status === 'PROCESSING').length
  const shippedOrdersCount = orders.filter(o => o.status === 'SHIPPED').length
  const totalRevenue = orders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Porositë</h1>
          <p className="text-gray-600">Menaxho porositë e klientëve dhe statusin e dërgesave</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Download size={20} />
          <span>Eksporto</span>
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Porosi të Reja</p>
              <p className="text-2xl font-bold text-gray-900">{newOrdersCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Package size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Në Proces</p>
              <p className="text-2xl font-bold text-gray-900">{processingOrdersCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Truck size={24} className="text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Të Dërguara</p>
              <p className="text-2xl font-bold text-gray-900">{shippedOrdersCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Të Ardhurat</p>
              <p className="text-2xl font-bold text-gray-900">€{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setStatusFilter('PENDING')}
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 flex items-center space-x-2"
          >
            <Clock size={16} />
            <span>Porosi të Reja ({newOrdersCount})</span>
          </button>
          <button 
            onClick={() => setStatusFilter('PROCESSING')}
            className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 flex items-center space-x-2"
          >
            <Package size={16} />
            <span>Në Proces ({processingOrdersCount})</span>
          </button>
          <button 
            onClick={() => setStatusFilter('SHIPPED')}
            className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 flex items-center space-x-2"
          >
            <Truck size={16} />
            <span>Të Dërguara ({shippedOrdersCount})</span>
          </button>
          <button 
            onClick={() => setStatusFilter('')}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
          >
            Të Gjitha
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 sm:w-80">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Kërko porosi, klient ose email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Të gjitha statuset</option>
              {Object.entries(ORDER_STATUSES).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={16} />
              <span>Filtro</span>
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Më të rinj</option>
              <option value="oldest">Më të vjetër</option>
              <option value="amount-high">Vlera e lartë</option>
              <option value="amount-low">Vlera e ulët</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Pagese</label>
                <select 
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Të gjitha</option>
                  {Object.entries(PAYMENT_STATUSES).map(([key, status]) => (
                    <option key={key} value={key}>{status.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Periudha</label>
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Të gjitha</option>
                  <option value="today">Sot</option>
                  <option value="week">Javën e fundit</option>
                  <option value="month">Muajin e fundit</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredAndSortedOrders.length} porosi gjithsej
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porosi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klienti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shuma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagesa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veprimet
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filteredAndSortedOrders.length > 0 ? (
                filteredAndSortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.itemsCount} artikuj</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.shippingEmail}</p>
                        {order.shippingPhone && (
                          <p className="text-xs text-gray-500">{order.shippingPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('sq-AL')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('sq-AL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">€{order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        PAYMENT_STATUSES[order.paymentStatus as keyof typeof PAYMENT_STATUSES]?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {PAYMENT_STATUSES[order.paymentStatus as keyof typeof PAYMENT_STATUSES]?.label || order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => fetchOrderDetails(order.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Shiko detajet"
                        >
                          <Eye size={16} />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          {Object.entries(ORDER_STATUSES).map(([key, status]) => (
                            <option key={key} value={key}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <ShoppingCart size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka porosi</h3>
                      <p className="text-gray-500">Nuk u gjetën porosi që përputhen me filtrat tuaj.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Porosi #{selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informacionet e Porosisë</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data:</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleDateString('sq-AL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        ORDER_STATUSES[selectedOrder.status as keyof typeof ORDER_STATUSES]?.color
                      }`}>
                        {ORDER_STATUSES[selectedOrder.status as keyof typeof ORDER_STATUSES]?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status Pagese:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        PAYMENT_STATUSES[selectedOrder.paymentStatus as keyof typeof PAYMENT_STATUSES]?.color
                      }`}>
                        {PAYMENT_STATUSES[selectedOrder.paymentStatus as keyof typeof PAYMENT_STATUSES]?.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informacionet e Klientit</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-400 mr-2" />
                      <span>{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={16} className="text-gray-400 mr-2" />
                      <span>{selectedOrder.shippingEmail}</span>
                    </div>
                    {selectedOrder.shippingPhone && (
                      <div className="flex items-center">
                        <Phone size={16} className="text-gray-400 mr-2" />
                        <span>{selectedOrder.shippingPhone}</span>
                      </div>
                    )}
                    <div className="flex items-start">
                      <MapPin size={16} className="text-gray-400 mr-2 mt-1" />
                      <span>
                        {selectedOrder.shippingAddress}<br />
                        {selectedOrder.shippingCity} {selectedOrder.shippingZip}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.orderItems && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Artikujt e Porosisë</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Produkti
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Sasia
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Çmimi
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Totali
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded mr-3">
                                  {item.product.images && (
                                    <img 
                                      src={JSON.parse(item.product.images)[0]?.url} 
                                      alt={item.product.name}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  )}
                                </div>
                                <span className="text-sm font-medium">{item.product.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm">€{item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-medium">€{item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t pt-6">
                <div className="max-w-sm ml-auto space-y-2">
                  <div className="flex justify-between">
                    <span>Nëntotali:</span>
                    <span>€{selectedOrder.subtotal?.toFixed(2) || (selectedOrder.total - (selectedOrder.shipping || 0) - (selectedOrder.tax || 0)).toFixed(2)}</span>
                  </div>
                  {selectedOrder.shipping && selectedOrder.shipping > 0 && (
                    <div className="flex justify-between">
                      <span>Dërgesa:</span>
                      <span>€{selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.tax && selectedOrder.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Taksa:</span>
                      <span>€{selectedOrder.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Totali:</span>
                    <span>€{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.entries(ORDER_STATUSES).map(([key, status]) => (
                    <option key={key} value={key}>{status.label}</option>
                  ))}
                </select>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Printo Faturën
                </button>
                <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Dërgo Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
