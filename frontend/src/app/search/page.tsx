'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  discountPercentage?: number
  image: string
  rating: number
  reviewCount: number
  stock: number
  category: {
    name: string
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')

  const query = searchParams.get('q') || ''

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&sort=${sortBy}&limit=50`)
        
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        } else {
          toast.error('Gabim në kërkim')
        }
      } catch (error) {
        console.error('Search error:', error)
        toast.error('Gabim në server')
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [query, sortBy])

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1)
  }

  const handleBuyNow = async (productId: string) => {
    await addToCart(productId, 1)
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="bg-gray-200 rounded-xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rezultatet e kërkimit
          </h1>
          {query && (
            <p className="text-gray-600 text-lg">
              Rezultatet për &quot;<span className="font-semibold text-purple-600">{query}</span>&quot; 
              ({products.length} produkte)
            </p>
          )}
        </div>

        {/* Sort Options */}
        {products.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Rendit sipas:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
              >
                <option value="name">Emrit</option>
                <option value="price_asc">Çmimi (ulët → lartë)</option>
                <option value="price_desc">Çmimi (lartë → ulët)</option>
                <option value="rating">Vlerësimit</option>
                <option value="newest">Më të rejat</option>
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-2xl bg-gray-100 h-48">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      📦
                    </div>
                  )}
                  {product.discountPercentage && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{product.discountPercentage}%
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Mbaruar</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-3">{product.category.name}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({product.reviewCount})</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      €{product.discountPrice || product.price}
                    </span>
                    {product.discountPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        €{product.price}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-2 px-4 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🛒 Shto
                    </button>
                    <button
                      onClick={() => handleBuyNow(product.id)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⚡ Bli
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Stok: {product.stock} copë
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {query ? 'Nuk u gjetën rezultate' : 'Bëni një kërkim'}
            </h3>
            <p className="text-gray-500 mb-6">
              {query 
                ? `Nuk u gjetën produkte për "${query}". Provoni me fjalë të tjera.`
                : 'Shkruani diçka në kuti të kërkimit për të gjetur produktet.'
              }
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
            >
              Kthehu në faqen kryesore
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  )
}
