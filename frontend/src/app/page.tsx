'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import CartModal from '@/components/CartModal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  image: string
  productCount: number
}

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  discountPercentage?: number
  image: string
  rating: number
  reviewCount: number
  category: {
    name: string
  }
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [offerProducts, setOfferProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { addToCart, buyNow, getTotalItems, isLoading: cartLoading } = useCart()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await fetch('/api/categories')
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])

  // Fetch featured products (dedicated route)
  try {
    const productsRes = await fetch('/api/products/featured?limit=8')
    if (productsRes.ok) {
      const productsData = await productsRes.json()
      setProducts(productsData.products || productsData?.products || [])
    }
  } catch (e) { console.warn('Featured products fetch failed, fallback', e) }
  if (products.length === 0) {
    try {
      const fallbackRes = await fetch('/api/products?limit=8')
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json()
        setProducts(fbData.products || [])
      }
    } catch {}
  }
  // Fetch offers
  try {
    const offersRes = await fetch('/api/products/offers?limit=8')
    if (offersRes.ok) {
      const offersData = await offersRes.json()
      setOfferProducts(offersData.products || offersData?.products || [])
    }
  } catch (e) { console.warn('Offers products fetch failed') }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1)
  }

  const handleBuyNow = async (productId: string) => {
    await buyNow(productId, 1)
    router.push('/checkout')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/category/${categorySlug}`)
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
  <header className="bg-white shadow-md md:shadow-2xl sticky top-0 z-50 border-b-2 md:border-b-4 border-gradient-to-r from-purple-500 to-cyan-500">
        <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 text-white text-sm py-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10"></div>
          <div className="container mx-auto px-4 flex justify-center relative z-10">
            <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4 gap-y-1">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-2 sm:px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <span className="flex items-center gap-1 font-medium text-white text-xs">
                  <span className="text-sm">📞</span> 
                  <span className="hidden sm:inline">Viber/WhatsApp:</span> 
                  <span className="font-semibold">+383 44 123 456</span>
                </span>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-2 sm:px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <span className="flex items-center gap-1 font-medium text-white text-xs">
                  <span className="text-sm">✉️</span> 
                  <span className="hidden lg:inline">Email:</span> 
                  <span className="font-semibold">info@proudshop.com</span>
                </span>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-2 sm:px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <span className="flex items-center gap-1 font-medium text-white text-xs">
                  <span className="text-sm">🚚</span> 
                  <span className="hidden sm:inline">Dërgesë e shpejtë</span> 
                  <span className="font-semibold">24-48h</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative group cursor-pointer">
                {/* Logo icon */}
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:rotate-3 group-hover:scale-110">
                  <span className="text-lg sm:text-2xl">🛍️</span>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-lg sm:rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-xl"></div>
              </div>
              
              {/* Brand name */}
              <div className="cursor-pointer group">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform group-hover:scale-105">
                  Proud<span className="text-orange-500">Shop</span>
                </h1>
                <div className="h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            </div>
            
            <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-8">
              <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text" 
                  placeholder="🔍 Kërkoni..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-6 py-2 sm:py-4 border-2 sm:border-3 border-purple-200 rounded-lg sm:rounded-2xl focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 text-sm sm:text-lg font-medium shadow-lg group-hover:shadow-xl"
                />
                <button 
                  type="submit"
                  className="absolute right-2 sm:right-4 top-2 sm:top-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🔍
                </button>
              </form>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={() => setCartModalOpen(true)}
                className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl hover:from-orange-500 hover:to-red-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 relative"
              >
                <span className="text-lg sm:text-xl">🛒</span>
                <span className="hidden sm:inline text-sm sm:text-base">Shporta ({getTotalItems()})</span>
                <span className="sm:hidden text-xs">({getTotalItems()})</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-yellow-400 text-gray-900 text-xs sm:text-sm rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center font-black animate-bounce">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
  {/* Hero Section (compacted) */}
  <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 text-white py-8 md:py-20 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {/* Hide most animated elements on mobile for performance */}
            <div className="hidden md:block absolute top-10 left-10 w-32 h-32 bg-yellow-400/20 rounded-full animate-bounce delay-1000 blur-sm"></div>
            <div className="hidden md:block absolute top-20 right-20 w-24 h-24 bg-pink-400/20 rounded-full animate-pulse delay-500 blur-sm"></div>
            <div className="hidden md:block absolute bottom-20 left-20 w-40 h-40 bg-cyan-400/20 rounded-full animate-ping delay-700 blur-sm"></div>
            <div className="hidden md:block absolute bottom-10 right-10 w-20 h-20 bg-green-400/20 rounded-full animate-bounce delay-300 blur-sm"></div>
            <div className="absolute top-1/2 left-1/2 w-40 md:w-64 h-40 md:h-64 -translate-x-1/2 -translate-y-1/2 bg-white/10 md:bg-white/5 rounded-full md:animate-pulse blur-xl"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 md:mb-6 bg-gradient-to-r from-white via-yellow-200 to-cyan-200 bg-clip-text text-transparent leading-tight tracking-tight">
                Mirë se erdhët në ProudShop!
              </h1>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl mb-5 md:mb-8 text-cyan-100 font-medium leading-relaxed max-w-2xl mx-auto">
                🎉 Dyqani juaj online për produkte të cilësisë së lartë me çmime të arsyeshme 
                <br className="hidden md:block" />
                <span className="text-yellow-300 font-bold text-lg md:text-2xl lg:text-3xl inline-block mt-2">
                  ✨ Oferta të pabesueshme çdo ditë!
                </span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-6 justify-center mb-6 md:mb-10 w-full sm:w-auto px-2">
                <button 
                  onClick={() => router.push('/products')}
                  className="group bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-gray-900 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-xl hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 transition-colors duration-300 shadow-lg md:shadow-xl relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2 md:gap-3">
                    <span className="text-2xl md:text-3xl">🛍️</span>
                    Fillo Blerjen Tani
                  </span>
                </button>
                <button 
                  onClick={() => router.push('/offers')}
                  className="group border border-cyan-300 bg-cyan-300/10 backdrop-blur text-white px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-xl hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-300 shadow-lg md:shadow-xl relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2 md:gap-3">
                    <span className="text-2xl md:text-3xl">⚡</span>
                    Shiko Ofertat Speciale
                  </span>
                </button>
              </div>
              
              {/* Promotional badges simplified */}
              <div className="flex justify-center gap-3 md:gap-6 flex-wrap px-2">
                {[
                  {icon:'🚚', text:'Dërgesë Falas mbi €50', color:'from-green-500 to-emerald-500'},
                  {icon:'💳', text:'Pagesë në Dorëzim', color:'from-blue-500 to-cyan-500'},
                  {icon:'🔄', text:'Kthim 30 Ditë', color:'from-purple-500 to-pink-500'}
                ].map(b => (
                  <div key={b.text} className={`bg-gradient-to-r ${b.color} text-white px-5 py-2 rounded-full text-sm md:text-base font-semibold shadow-md`}> <span className="flex items-center gap-2"><span>{b.icon}</span>{b.text}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Info Bar */}
  <section className="bg-gradient-to-r from-emerald-50 via-cyan-50 to-purple-50 py-6 md:py-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-purple-100/50"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-center">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4 bg-white/80 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 md:hover:scale-110 group border border-emerald-200">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-2xl md:text-3xl">🚚</span>
                </div>
                <div>
                  <div className="font-black text-gray-800 text-lg md:text-xl">Dërgesë e shpejtë</div>
                  <div className="text-sm text-gray-600 font-medium">Brenda 24-48 orëve</div>
                  <div className="text-xs text-emerald-600 font-bold mt-1">⚡ Express disponibël</div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4 bg-white/80 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 md:hover:scale-110 group border border-blue-200">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-2xl md:text-3xl">💳</span>
                </div>
                <div>
                  <div className="font-black text-gray-800 text-lg md:text-xl">Kundërpagesë</div>
                  <div className="text-sm text-gray-600 font-medium">Pagesë në dorëzim</div>
                  <div className="text-xs text-blue-600 font-bold mt-1">🔒 100% e sigurt</div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4 bg-white/80 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 md:hover:scale-110 group border border-purple-200">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-2xl md:text-3xl">📍</span>
                </div>
                <div>
                  <div className="font-black text-gray-800 text-lg md:text-xl">Depo në Kosovë</div>
                  <div className="text-sm text-gray-600 font-medium">Stok lokal</div>
                  <div className="text-xs text-purple-600 font-bold mt-1">📦 Gjithmonë në dispozicion</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
  <section className="py-6 md:py-10 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Kategoritë tona
            </h2>
            {loading ? (
              <div className="flex justify-start md:justify-center gap-3 md:gap-6 overflow-x-auto pb-4 px-2 snap-x snap-mandatory">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div key={item} className="bg-gray-200 animate-pulse rounded-2xl h-24 md:h-32 w-32 md:w-40 flex-shrink-0"></div>
                ))}
              </div>
            ) : (
              <div className="flex justify-start md:justify-center gap-3 md:gap-6 overflow-x-auto pb-4 px-2 snap-x snap-mandatory">
                {categories.map((category, index) => {
                  const colors = [
                    'from-orange-400 to-red-500',
                    'from-blue-400 to-purple-500', 
                    'from-green-400 to-emerald-500',
                    'from-indigo-400 to-purple-500',
                    'from-pink-400 to-rose-500',
                    'from-yellow-400 to-orange-500'
                  ]
                  const bgColors = [
                    'from-orange-50 to-red-50',
                    'from-blue-50 to-purple-50',
                    'from-green-50 to-emerald-50',
                    'from-indigo-50 to-purple-50',
                    'from-pink-50 to-rose-50',
                    'from-yellow-50 to-orange-50'
                  ]
                  return (
                    <div 
                      key={category.id} 
                      onClick={() => handleCategoryClick(category.slug)}
                      className={`bg-gradient-to-br ${bgColors[index % bgColors.length]} p-3 md:p-5 rounded-xl md:rounded-2xl shadow-md md:shadow-lg hover:shadow-xl transition-transform duration-300 cursor-pointer group md:hover:scale-105 border border-white/50 hover:border-white relative overflow-hidden w-28 sm:w-32 md:w-40 flex-shrink-0 snap-start`}
                    >
                      {/* Background glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-6 relative z-10`}>
                        <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-300">{category.image}</span>
                      </div>
                      
                      <div className="relative z-10">
                        <h3 className="font-bold text-center mb-1 md:mb-2 text-gray-800 text-xs md:text-sm group-hover:text-gray-900 transition-colors">{category.name}</h3>
                        <p className="text-xs text-gray-600 text-center group-hover:text-gray-700 transition-colors">
                          <span className="font-semibold">{category.productCount}+</span> produkte
                        </p>
                        <div className="mt-2 md:mt-3 text-center">
                          <span className={`inline-block bg-gradient-to-r ${colors[index % colors.length]} text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-md group-hover:shadow-lg transition-all duration-300`}>
                            Shiko →
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Featured Products */}
  <section className="py-6 md:py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              Produktet më të shitura
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div key={item} className="bg-gray-200 animate-pulse rounded-2xl h-64 md:h-80"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg overflow-hidden md:hover:shadow-2xl transition-colors duration-300 group cursor-pointer border border-gray-100 hover:border-purple-200">
                    <div 
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="h-40 md:h-56 bg-gradient-to-br from-purple-100 via-pink-100 to-cyan-100 flex items-center justify-center relative overflow-hidden cursor-pointer rounded-t-xl md:rounded-t-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 group-hover:from-purple-500/20 group-hover:to-cyan-500/20 transition-all duration-500"></div>
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 relative z-10">
                          <span className="text-4xl md:text-8xl mb-2 group-hover:scale-110 transition-transform duration-300">📦</span>
                          <span className="text-xs md:text-sm font-medium">Foto e produktit</span>
                        </div>
                      )}
                      {/* Enhanced hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <div className="bg-white/95 backdrop-blur-md rounded-full px-3 md:px-6 py-1 md:py-2 text-xs md:text-sm font-bold text-gray-800 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          🔍 Kliko për detaje
                        </div>
                      </div>
                      {/* Price badge overlay */}
                        <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg">
                        €{Number((product.discountPrice ?? product.price) ?? 0).toFixed(2)}
                      </div>
                      {product.discountPrice && (
                        <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg animate-pulse">
                          -{product.discountPercentage}%
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-6 bg-white">
                      <div className="flex items-start justify-between mb-2 md:mb-3">
                        <h3 
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="font-bold text-gray-800 text-sm md:text-lg hover:text-purple-600 transition-colors cursor-pointer line-clamp-2 leading-tight flex-1"
                        >
                          {product.name}
                        </h3>
                        <span className="text-xs bg-purple-100 text-purple-600 px-1 md:px-2 py-1 rounded-full font-medium whitespace-nowrap ml-1 md:ml-2">
                          {product.category?.name || 'Kategoria'}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-2 md:mb-4">
                        <div className="flex text-yellow-400 text-sm md:text-lg">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="ml-1 md:ml-2 text-xs md:text-sm text-gray-500 font-medium">({product.reviewCount})</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <div className="flex flex-col">
              <div className="flex items-baseline gap-1 md:gap-2 leading-none">
                <span className="text-sm md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              €{Number((product.discountPrice ?? product.price) ?? 0).toFixed(2)}
                            </span>
                            {product.discountPrice && (
                              <span className="text-xs md:text-sm text-gray-400 line-through">
                                €{Number(product.price ?? 0).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {product.discountPrice && (
                            <span className="text-xs text-red-600 font-bold">
                              Kursim €{Number(((product.price ?? 0) - (product.discountPrice ?? 0)) || 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product.id)
                          }}
                          disabled={cartLoading}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-2 md:px-4 py-2 md:py-3 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 text-xs md:text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 md:gap-2"
                        >
                          {cartLoading ? (
                            <div className="animate-spin w-3 md:w-4 h-3 md:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          ) : (
                            <>
                              <span className="text-sm md:text-lg">🛒</span>
                              <span>Shportë</span>
                            </>
                          )}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBuyNow(product.id)
                          }}
                          disabled={cartLoading}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 md:px-4 py-2 md:py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-xs md:text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 md:gap-2"
                        >
                          {cartLoading ? (
                            <div className="animate-spin w-3 md:w-4 h-3 md:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          ) : (
                            <>
                              <span className="text-sm md:text-lg">⚡</span>
                              <span>Blej</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Offers Products */}
  <section className="py-6 md:py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Ofertat Speciale
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {[1,2,3,4,5,6,7,8].map(i=> <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-64 md:h-80" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                {offerProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg overflow-hidden md:hover:shadow-2xl transition-colors duration-300 group cursor-pointer border border-gray-100 hover:border-red-200">
                    <div onClick={()=>router.push(`/products/${p.id}`)} className="h-40 md:h-56 bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 flex items-center justify-center relative overflow-hidden cursor-pointer rounded-t-xl md:rounded-t-2xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 group-hover:from-red-500/20 group-hover:to-orange-500/20 transition-all duration-500" />
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="flex flex-col items-center justify-center text-gray-400 relative z-10"><span className="text-4xl md:text-8xl mb-2 group-hover:scale-110 transition-transform duration-300">📦</span><span className="text-xs md:text-sm font-medium">Foto e produktit</span></div>}
                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg">
                        €{Number((p.discountPrice ?? p.price) ?? 0).toFixed(2)}
                      </div>
                      {p.discountPrice && <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-red-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg animate-pulse">- {p.discountPercentage}%</div>}
                    </div>
                    <div className="p-3 md:p-6 bg-white">
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 group-hover:text-red-600 transition-colors mb-2 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">{p.name}</h3>
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-base md:text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">€{p.discountPrice ? Number(p.discountPrice).toFixed(2) : Number(p.price).toFixed(2)}</span>
                          {p.discountPrice && <span className="text-xs md:text-sm line-through text-gray-400">€{Number(p.price).toFixed(2)}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>handleAddToCart(String(p.id))} className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">🛒 Shto</button>
                        <button onClick={()=>handleBuyNow(String(p.id))} className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">⚡ Bli</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
  <section className="py-8 md:py-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-cyan-300 to-yellow-300 bg-clip-text text-transparent">
              Qëndro i informuar
            </h2>
            <p className="text-base md:text-lg mb-6 md:mb-8 text-cyan-100">
              Regjistrohu për të marrë ofertat më të mira dhe produktet e reja
            </p>
            <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 md:gap-4">
              <input 
                type="email" 
                placeholder="Email adresa juaj"
                className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl text-gray-900 border-2 border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-400 transition-all duration-300"
              />
              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                🚀 Regjistrohu
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
  <footer className="bg-gradient-to-b from-gray-900 to-black text-white text-sm md:text-base">
        {/* Service Icons */}
        <div className="border-b border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex items-center justify-center space-x-4 bg-gradient-to-r from-emerald-600/20 to-green-600/20 backdrop-blur rounded-2xl p-6 hover:from-emerald-600/30 hover:to-green-600/30 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🚚</span>
                </div>
                <div>
                  <div className="font-bold text-emerald-300">Dërgesë e shpejtë</div>
                  <div className="text-sm text-gray-300">Brenda 24-48 orëve</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur rounded-2xl p-6 hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🛡️</span>
                </div>
                <div>
                  <div className="font-bold text-cyan-300">Kundërpagesë</div>
                  <div className="text-sm text-gray-300">Pagesë në dorëzim</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur rounded-2xl p-6 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <div className="font-bold text-purple-300">Depo në Kosovë</div>
                  <div className="text-sm text-gray-300">Stok lokal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Content */}
          <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                <div className="relative group">
                  {/* Logo icon */}
                  <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-xl">🛍️</span>
                  </div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                </div>
                
                {/* Brand name */}
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Proud<span className="text-orange-400">Shop</span>
                  </h1>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Dyqani juaj online më i besueshëm në Kosovë dhe Shqipëri.
              </p>
              <div className="space-y-3">
                <p className="text-purple-300 hover:text-purple-200 transition-colors">📞 Viber: +383 44 123 456</p>
                <p className="text-cyan-300 hover:text-cyan-200 transition-colors">✉️ info@proudshop.com</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-cyan-300 text-lg">Lidhje të shpejta</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors hover:translate-x-2 transform duration-300 inline-block">→ Kryefaqja</Link></li>
                <li><a href="/produktet" className="text-gray-300 hover:text-white transition-colors hover:translate-x-2 transform duration-300 inline-block">→ Produktet</a></li>
                <li><a href="/ofertat" className="text-gray-300 hover:text-white transition-colors hover:translate-x-2 transform duration-300 inline-block">→ Ofertat</a></li>
                <li><a href="/kontakti" className="text-gray-300 hover:text-white transition-colors hover:translate-x-2 transform duration-300 inline-block">→ Kontakti</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-purple-300 text-lg">Informacione</h3>
              <ul className="space-y-3">
                <li><a href="/kushtet" className="text-gray-300 hover:text-white transition-colors hover:translate-x-2 transform duration-300 inline-block">→ Kushtet e përdorimit</a></li>
                <li><a href="/politika" className="text-gray-300 hover:text-white transition-colors hover:translate-x-2 transform duration-300 inline-block">→ Politika e privatësisë</a></li>
                <li><a href="/garancie" className="text-gray-300 hover:text-white transition-colors hover:translate-x-2 transform duration-300 inline-block">→ Garancia</a></li>
                <li><a href="/rreth-nesh" className="text-gray-300 hover:text-white transition-colors hover:translate-x-2 transform duration-300 inline-block">→ Rreth nesh</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">
                © 2025 ProudShop. Të gjitha të drejtat e rezervuara.
              </p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 text-sm font-semibold mt-4 md:mt-0 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ↑ Kthehu në fillim
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Modal */}
      <CartModal isOpen={cartModalOpen} onClose={() => setCartModalOpen(false)} />
    </div>
  )
}
