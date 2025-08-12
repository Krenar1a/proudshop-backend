'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Search, Edit, Trash2, Eye, Filter, Star, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  price: number
  stockQuantity: number
  category: {
    name: string
  }
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  images?: string
  shortDesc?: string
  brand?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else if (response.status === 401) {
        toast.error('Duhet të bëni login si admin')
        window.location.href = '/admin/login'
      } else {
        toast.error('Gabim në ngarkimin e produkteve')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Gabim në ngarkimin e produkteve')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Produkti u fshi me sukses')
        fetchProducts() // Reload products
      } else if (response.status === 401) {
        toast.error('Duhet të bëni login si admin')
        window.location.href = '/admin/login'
      } else {
        toast.error('Gabim në fshirjen e produktit')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Gabim në fshirjen e produktit')
    }
  }

  // Helpers to safely read possibly-missing fields from migrated backend
  const getName = (p: any) => String(p?.name ?? p?.title ?? '')
  const getBrand = (p: any) => String(p?.brand ?? '')
  const getPrice = (p: any) => Number(p?.price ?? p?.price_eur ?? 0)
  const getStock = (p: any) => Number(p?.stockQuantity ?? p?.stock ?? 0)
  const getCreatedTs = (p: any) => new Date(p?.createdAt ?? p?.created_at ?? 0).getTime()
  const getCategoryName = (p: any) => {
    const direct = p?.category?.name
    if (direct) return String(direct)
    const cid = p?.category_id ?? p?.categoryId
    if (cid == null) return ''
    const found = categories.find(c => String((c as any).id) === String(cid) || c.name === String(cid))
    return found?.name ?? ''
  }

  const searchQ = searchTerm.toLowerCase()
  const filteredAndSortedProducts = products
    .filter((product: any) => {
      const matchesSearch =
        !searchQ ||
        getName(product).toLowerCase().includes(searchQ) ||
        getBrand(product).toLowerCase().includes(searchQ)
      const matchesCategory = !selectedCategory || getCategoryName(product) === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return getCreatedTs(b) - getCreatedTs(a)
        case 'oldest':
          return getCreatedTs(a) - getCreatedTs(b)
        case 'price-high':
          return getPrice(b) - getPrice(a)
        case 'price-low':
          return getPrice(a) - getPrice(b)
        case 'name':
          return getName(a).localeCompare(getName(b))
        case 'stock':
          return getStock(b) - getStock(a)
        default:
          return 0
      }
    })

  const lowStockProducts = products.filter((p: any) => getStock(p) <= 5).length
  const outOfStockProducts = products.filter((p: any) => getStock(p) === 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produktet</h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-gray-600">Menaxho produktet e dyqanit</p>
            {lowStockProducts > 0 && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{lowStockProducts} me stok të ulët</span>
              </div>
            )}
            {outOfStockProducts > 0 && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{outOfStockProducts} pa stok</span>
              </div>
            )}
          </div>
        </div>
        <Link href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Shto Produkt</span>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 sm:w-80">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Kërko produktet ose brendet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Të gjitha kategoritë</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
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
              <option value="name">Emër A-Z</option>
              <option value="price-high">Çmimi i lartë</option>
              <option value="price-low">Çmimi i ulët</option>
              <option value="stock">Stok i lartë</option>
            </select>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Të gjithë</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Jo aktiv</option>
                  <option value="featured">I veçantë</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stoku</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Të gjithë</option>
                  <option value="in-stock">Me stok</option>
                  <option value="low-stock">Stok i ulët</option>
                  <option value="out-of-stock">Pa stok</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Çmimi</label>
                <div className="flex space-x-2">
                  <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredAndSortedProducts.length} produkte gjithsej
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produkti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Çmimi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stoku
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statusi
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
                      <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filteredAndSortedProducts.length > 0 ? (
                filteredAndSortedProducts.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                          {typeof product.images === 'string' && product.images.trim().startsWith('[') ? (
                            <img
                              src={(() => { try { const arr = JSON.parse(product.images); return arr?.[0]?.url || arr?.[0] || '' } catch { return '' } })()}
                              alt={getName(product)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                if (nextElement) nextElement.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <Package size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getName(product)}</p>
                          {product.brand && (
                            <p className="text-xs text-blue-600">{product.brand}</p>
                          )}
                          {product.shortDesc && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">{product.shortDesc}</p>
                          )}
                          <p className="text-xs text-gray-400">ID: {String(product.id).slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{getCategoryName(product) || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">€{getPrice(product).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          getStock(product) === 0 ? 'text-red-600' :
                          getStock(product) <= 5 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {getStock(product)}
                        </span>
                        {getStock(product) <= 5 && (
                          <AlertCircle size={14} className="ml-1 text-orange-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (product as any).isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(product as any).isActive ? 'Aktiv' : 'Joaktiv'}
                        </span>
                        {(product as any).isFeatured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            <Star size={10} className="mr-1" />
                            I veçantë
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => window.open(`/products/${product.id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800"
                          title="Shiko produktin"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => window.location.href = `/admin/products/edit/${product.id}`}
                          className="text-green-600 hover:text-green-800"
                          title="Edito produktin"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('A jeni të sigurt që doni të fshini këtë produkt?')) {
                              deleteProduct(product.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Fshi produktin"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nuk u gjetën produkte</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
