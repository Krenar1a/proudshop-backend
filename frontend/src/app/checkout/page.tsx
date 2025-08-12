'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart, updateQuantity, removeFromCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Shipping Info
    shippingName: '',
    shippingEmail: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingZip: '',
    shippingCountry: 'Kosovo',
    
    // Payment
    paymentMethod: 'cash_on_delivery',
    
    // Notes
    notes: ''
  })

  const subtotal = getTotalPrice()
  const isKosovo = formData.shippingCountry?.toLowerCase() === 'kosovo' || 
                   formData.shippingCountry?.toLowerCase() === 'kosovë'
  const shippingCost = subtotal > (isKosovo ? 50 : 5000) ? 0 : (isKosovo ? 5 : 500)
  const total = subtotal + shippingCost
  const currency = isKosovo ? 'EUR' : 'LEK'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      toast.error('Shporta është e zbrazët')
      return
    }

    setIsSubmitting(true)
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingInfo: {
          name: formData.shippingName,
          email: formData.shippingEmail,
          phone: formData.shippingPhone,
          address: formData.shippingAddress,
          city: formData.shippingCity,
          zipCode: formData.shippingZip,
          country: formData.shippingCountry
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gabim në krijimin e porosisë')
      }

      const result = await response.json()
      
      // Clear cart and redirect to success page
      try {
        const shipping = {
          name: formData.shippingName,
          email: formData.shippingEmail,
          phone: formData.shippingPhone,
          address: formData.shippingAddress,
          city: formData.shippingCity,
          zip: formData.shippingZip,
          country: formData.shippingCountry
        }
        sessionStorage.setItem('lastOrderShipping', JSON.stringify(shipping))
      } catch {}
      clearCart()
      toast.success('Porosia u krijua me sukses!')
      router.push(`/order-success?orderNumber=${result.order.orderNumber}`)
      
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(error instanceof Error ? error.message : 'Gabim në krijimin e porosisë')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Shporta është e zbrazët</h1>
          <p className="text-gray-600 mb-6">Shtoni produkte për të vazhduar me blerjen</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
          >
            Kthehu në dyqan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Përfundoni porosinë
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Informacionet e dërgesës</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emri dhe mbiemri *
                    </label>
                    <input
                      type="text"
                      name="shippingName"
                      value={formData.shippingName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="shippingEmail"
                      value={formData.shippingEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefoni *
                  </label>
                  <input
                    type="tel"
                    name="shippingPhone"
                    value={formData.shippingPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresa *
                  </label>
                  <input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qyteti
                    </label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kodi postal
                    </label>
                    <input
                      type="text"
                      name="shippingZip"
                      value={formData.shippingZip}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shteti *
                    </label>
                    <select
                      name="shippingCountry"
                      value={formData.shippingCountry}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Kosovo">Kosovo</option>
                      <option value="Shqipëri">Shqipëri</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metoda e pagesës
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="cash_on_delivery">Kundërpagesë (Pagesë në dorëzim)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shënime (opsionale)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Shënime shtesë për porosinë..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-4 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 font-semibold text-lg"
                >
                  {isSubmitting ? 'Duke procesuar...' : `Porosit tani - ${total.toFixed(2)} ${currency}`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Përmbledhja e porosisë</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-200">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">Sasia:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-1 hover:bg-gray-100 text-xs"
                          >
                            −
                          </button>
                          <span className="px-2 py-1 border-x border-gray-300 text-xs min-w-[30px] text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100 text-xs"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-xs ml-2"
                        >
                          Hiq
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span>Nëntotali:</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dërgesa:</span>
                  <span>{shippingCost === 0 ? 'FALAS' : `€${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-purple-600">
                  <span>Totali:</span>
                  <span>{total.toFixed(2)} {currency}</span>
                </div>
              </div>

              {subtotal > (isKosovo ? 50 : 5000) && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    🎉 Urime! Keni fituar dërgesë falas!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
