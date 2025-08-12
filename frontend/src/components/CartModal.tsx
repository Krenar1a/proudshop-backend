'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  const handleCheckout = () => {
    setIsCheckingOut(true)
    onClose()
    router.push('/checkout')
  }

  const handleContinueShopping = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Shporta juaj</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Shporta është e zbrazët</h3>
              <p className="text-gray-500 mb-6">Shtoni produkte për të filluar blerjen</p>
              <button
                onClick={handleContinueShopping}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
              >
                Vazhdoni me blerje
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="max-h-96 overflow-y-auto mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-purple-600">€{item.price.toFixed(2)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-sm text-gray-500 line-through">€{item.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        disabled={item.quantity >= item.inStock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">Totali:</span>
                  <span className="text-2xl font-bold text-purple-600">€{getTotalPrice().toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleContinueShopping}
                    className="flex-1 border-2 border-purple-500 text-purple-500 py-3 rounded-xl hover:bg-purple-50 transition-colors"
                  >
                    Vazhdoni me blerje
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-6 border-2 border-red-500 text-red-500 py-3 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Zbraz shportën
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-3 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50"
                  >
                    {isCheckingOut ? 'Duke procesuar...' : 'Porosit tani'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
