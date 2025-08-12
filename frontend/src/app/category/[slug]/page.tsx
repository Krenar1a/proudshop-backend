'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface Category {
  id: string
  name: string
  description: string
  image: string
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  const categorySlug = params.slug as string

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true)
        
        // Fetch category info
        const categoryRes = await fetch(`/api/categories/${categorySlug}`)
        if (categoryRes.ok) {
          const categoryData = await categoryRes.json()
          setCategory(categoryData.category)
        }

        // Fetch products in this category
        const productsRes = await fetch(`/api/products?category=${categorySlug}&sort=${sortBy}`)
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData.products || [])
        }
      } catch (error) {
        console.error('Error fetching category data:', error)
        toast.error('Gabim në ngarkimin e kategorisë')
      } finally {
        setLoading(false)
      }
    }

    if (categorySlug) {
      fetchCategoryData()
    }
  }, [categorySlug, sortBy])

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1)
  }

  const handleBuyNow = async (productId: string) => {
    await addToCart(productId, 1)
    router.push('/checkout')
  }

  const filteredProducts = products.filter(product => 
    product.price >= priceRange[0] && product.price <= priceRange[1]
  )

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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Kategoria nuk u gjet</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
          >
            Kthehu në faqen kryesore
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button 
                onClick={() => router.push('/')}
                className="hover:text-purple-600 transition-colors"
              >
                Kryefaqja
              </button>
            </li>
            <li className="before:content-['/'] before:mx-2">
              <span className="text-gray-900 font-medium">{category.name}</span>
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              {category.image}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
              <p className="text-gray-600 text-lg">{category.description}</p>
              <p className="text-sm text-gray-500 mt-2">{filteredProducts.length} produkte</p>
            </div>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sort */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rendit sipas:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
              >
                <option value="name">Emrit</option>
                <option value="price_asc">Çmimi (ulët → lartë)</option>
                <option value="price_desc">Çmimi (lartë → ulët)</option>
                <option value="rating">Vlerësimit</option>
                <option value="newest">Më të rejat</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çmimi: €{priceRange[0]} - €{priceRange[1]}
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nuk ka produkte</h3>
            <p className="text-gray-500 mb-6">Nuk ka produkte në këtë kategori aktualisht</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
            >
              Shiko kategoritë e tjera
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
