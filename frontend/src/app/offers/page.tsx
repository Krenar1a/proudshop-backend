'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Star, Clock, Zap, Percent } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  discountPrice: number
  discountPercentage: number
  thumbnail: string
  category: {
    name: string
    slug: string
  }
  rating: number
  reviewCount: number
  stockQuantity: number
}

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0
  })
  
  const { addToCart, isLoading: cartLoading } = useCart()
  const router = useRouter()

  useEffect(() => {
    fetchOffers()
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          // Reset timer for demo
          return { hours: 24, minutes: 0, seconds: 0 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/products?offers=true')
      if (response.ok) {
        const data = await response.json()
        // Filter products that have discounts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const discountedProducts = (data.products || []).filter((p: any) => p.discountPrice && p.discountPrice < p.price)
        setProducts(discountedProducts)
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast.error('Gabim në ngarkimin e ofertave')
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

  const calculateSavings = (original: number, discounted: number) => {
    return original - discounted
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-gray-200 rounded-lg h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Zap className="text-yellow-300 mr-2" size={32} />
            <h1 className="text-4xl md:text-6xl font-bold">Ofertat e Ditës</h1>
            <Zap className="text-yellow-300 ml-2" size={32} />
          </div>
          <p className="text-xl md:text-2xl mb-8 text-yellow-100">
            Zbritje të mëdha deri në 70% - Vetëm për sot!
          </p>
          
          {/* Countdown Timer */}
          <div className="flex justify-center space-x-4 mb-8">
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className="text-sm text-yellow-100">Orë</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className="text-sm text-yellow-100">Minuta</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className="text-sm text-yellow-100">Sekonda</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center text-yellow-200">
            <Clock className="mr-2" size={20} />
            <span className="text-lg">Oferta mbaron sot në mesnatë!</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">Nuk ka oferta aktive</h3>
            <p className="text-gray-500 mb-8">Kthehuni së shpejti për ofertat më të reja!</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Shiko të gjitha produktet
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {products.length} Produkte në Ofertë
              </h2>
              <p className="text-lg text-gray-600">
                Mos humbisni shansin për të kursyer!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative"
                >
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Percent size={14} className="mr-1" />
                      -{product.discountPercentage}%
                    </div>
                  </div>

                  {/* Product Image */}
                  <div 
                    className="h-48 bg-gray-100 cursor-pointer relative overflow-hidden"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    {product.thumbnail ? (
                      <img 
                        src={product.thumbnail} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        📦
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-semibold opacity-0 hover:opacity-100 transition-opacity duration-300">
                        Shiko detajet
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="text-sm text-gray-500 mb-1">{product.category.name}</div>
                    <h3 
                      className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 line-clamp-2"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">({product.reviewCount})</span>
                    </div>
                    
                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl font-bold text-red-600">
                          €{product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          €{product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Kurseni €{calculateSavings(product.price, product.discountPrice).toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Stock Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Në stok:</span>
                        <span className={`font-medium ${product.stockQuantity > 5 ? 'text-green-600' : 'text-orange-600'}`}>
                          {product.stockQuantity > 0 ? `${product.stockQuantity} copë` : 'Jashtë stokut'}
                        </span>
                      </div>
                      {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                        <div className="text-xs text-red-600 mt-1 font-medium">
                          ⚡ Vetëm {product.stockQuantity} copë të mbetura!
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={cartLoading || product.stockQuantity === 0}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <ShoppingCart size={16} className="mr-1" />
                        Shportë
                      </button>
                      <button
                        onClick={() => handleBuyNow(product.id)}
                        disabled={cartLoading || product.stockQuantity === 0}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Blej Tani
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Mos humbisni ofertat!</h2>
          <p className="text-xl mb-8 text-purple-100">
            Regjistrohuni për të marrë njoftimet për ofertat më të reja
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email adresa juaj"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
              Regjistrohu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
