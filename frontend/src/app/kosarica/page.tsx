'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Minus, Plus, X, Truck, Shield, Calendar } from 'lucide-react'

interface CartItem {
  id: number
  name: string
  price: number
  originalPrice: number
  quantity: number
  image: string
  inStock: boolean
}

// Mock cart data
const cartItems = [
  {
    id: 1,
    name: 'Kuti për ruajtjen e ushqimeve',
    price: 12.99,
    originalPrice: 29.99,
    quantity: 1,
    image: '/images/products/food-storage.jpg',
    inStock: true
  },
  {
    id: 2,
    name: 'Set thyerësh për kuzhinë',
    price: 19.99,
    originalPrice: 45.00,
    quantity: 2,
    image: '/images/products/kitchen-knives.jpg',
    inStock: true
  }
]

// Mock suggested product
const suggestedProduct = {
  id: 99,
  name: 'Etiketa me shënues',
  price: 4.49,
  checked: false
}

export default function CartPage() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const suggestedTotal = subtotal + (suggestedProduct.checked ? suggestedProduct.price : 0)
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-pink-500">Kryefaqja</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Shporta</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Shporta juaj ({cartItems.length} artikuj)</h1>
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Shporta juaj është bosh</h3>
                    <p className="text-gray-600 mb-6">Shtoni disa produkte për të vazhduar</p>
                    <Link 
                      href="/dyqan"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
                    >
                      Vazhdoni blerjen
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                )}

                {/* Suggested Product */}
                {cartItems.length > 0 && (
                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Rekomandojmë gjithashtu:</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          id="suggested-product"
                          className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <label htmlFor="suggested-product" className="flex items-center space-x-3 cursor-pointer">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center text-xl">
                            🏷️
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{suggestedProduct.name}</span>
                            <div className="text-sm text-gray-600">+{suggestedProduct.price.toFixed(2)} €</div>
                          </div>
                        </label>
                      </div>
                      <button className="text-pink-500 hover:text-pink-600 font-medium text-sm">
                        Shtoje në shportë
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Përmbledhja e porosisë</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Nëntotali:</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Dërgimi:</span>
                    <span className="text-green-600 font-medium">FALAS</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Totali:</span>
                      <span className="text-pink-600">{suggestedTotal.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 text-green-700">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">
                      Dërgimi i parashikuar: {estimatedDelivery.toLocaleDateString('sq-AL')}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button 
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300 mb-4"
                  disabled={cartItems.length === 0}
                >
                  Vazhdo në arkë
                </button>

                {/* Security Features */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Shield size={16} className="text-green-500" />
                    <span>Pagesa e sigurt</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck size={16} className="text-blue-500" />
                    <span>Dërgim i shpejtë</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-500">💳</span>
                    <span>Kundërpagesë e mundshme</span>
                  </div>
                </div>

                {/* Continue Shopping */}
                <div className="mt-6 pt-4 border-t">
                  <Link 
                    href="/dyqan"
                    className="block text-center text-pink-500 hover:text-pink-600 font-medium"
                  >
                    ← Vazhdoni blerjen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function CartItem({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-2xl">
        📦
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-pink-600">{item.price.toFixed(2)} €</span>
          <span className="text-sm text-gray-500 line-through">{item.originalPrice.toFixed(2)} €</span>
        </div>
        <div className="text-xs text-green-600 font-medium">
          Në stok
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button className="p-2 hover:bg-gray-100 rounded-l-lg">
            <Minus size={16} />
          </button>
          <span className="px-4 py-2 border-x border-gray-300 bg-white min-w-[50px] text-center">
            {item.quantity}
          </span>
          <button className="p-2 hover:bg-gray-100 rounded-r-lg">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Total Price */}
      <div className="text-right">
        <div className="font-bold text-gray-900">
          {(item.price * item.quantity).toFixed(2)} €
        </div>
      </div>

      {/* Remove Button */}
      <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
        <X size={20} />
      </button>
    </div>
  )
}
