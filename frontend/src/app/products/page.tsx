'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Grid, List, ShoppingCart, Star, Search } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  discountPercentage?: number
  thumbnail: string
  images: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  rating: number
  reviewCount: number
  stockQuantity: number
  isActive: boolean
  isFeatured: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [searchQuery, setSearchQuery] = useState('')
  
  const { addToCart, isLoading: cartLoading } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    
    // Check if there's a search query from URL
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, sortBy, searchQuery])

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
      setLoading(true)
      let url = `/api/products?sort=${sortBy}`
      
      if (selectedCategory) {
        url += `&category=${selectedCategory}`
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Gabim në ngarkimin e produkteve')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1)
  }

  const handleBuyNow = async (productId: string) => {
    await addToCart(productId, 1)
    router.push('/checkout')
  }

  const filteredProducts = products.filter(product => {
    const matchesPrice = (!priceRange.min || product.price >= Number(priceRange.min)) &&
                        (!priceRange.max || product.price <= Number(priceRange.max))
    return matchesPrice
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSearchQuery('')
    setSortBy('name')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Të gjitha Produktet</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kërkoni produktet..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kërko
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtrat</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Pastro të gjitha
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Kategoria</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Të gjitha kategoritë</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Çmimi</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="self-center text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    {filteredProducts.length} produkte të gjetur
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Emri A-Z</option>
                    <option value="name_desc">Emri Z-A</option>
                    <option value="price">Çmimi i ulët - i lartë</option>
                    <option value="price_desc">Çmimi i lartë - i ulët</option>
                    <option value="newest">Më të rejat</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Grid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nuk u gjetën produkte</h3>
                <p className="text-gray-500">Provoni të ndryshoni filtrat ose kërkimin</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={viewMode === 'grid' 
                    ? 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'
                    : 'bg-white rounded-lg shadow-md p-4 flex gap-4 hover:shadow-lg transition-shadow'
                  }>
                    <div className={viewMode === 'grid' ? 'h-48 bg-gray-100' : 'w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0'}>
                      {product.thumbnail ? (
                        <img 
                          src={product.thumbnail} 
                          alt={product.name}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => router.push(`/products/${product.id}`)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                          📦
                        </div>
                      )}
                    </div>
                    
                    <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                      <h3 
                        className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                        onClick={() => router.push(`/products/${product.id}`)}
                      >
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">({product.reviewCount})</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            €{(product.discountPrice || product.price).toFixed(2)}
                          </span>
                          {product.discountPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              €{product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={cartLoading || product.stockQuantity === 0}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                          >
                            <ShoppingCart size={16} />
                          </button>
                          <button
                            onClick={() => handleBuyNow(product.id)}
                            disabled={cartLoading || product.stockQuantity === 0}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                          >
                            Blej
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <ProductsContent />
    </Suspense>
  )
}
