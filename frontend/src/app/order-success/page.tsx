'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  total: number
  subtotal?: number
  shipping?: number
  tax?: number
  currency: string
  status: string
  paymentStatus?: string
  shippingName: string
  shippingEmail: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingZip?: string
  shippingCountry: string
  createdAt?: string
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    total: number
    product: {
      name: string
      image?: string | null
    }
  }>
}

function OrderSuccessContent() {
  const [order, setOrder] = useState<Order | null>(null)
  const [shippingFallback, setShippingFallback] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const orderNumber = searchParams.get('orderNumber')

  useEffect(() => {
    if (!orderNumber) {
      router.push('/')
      return
    }

    // Load shipping fallback from session (in case backend has no shipping fields yet)
    try {
      const raw = sessionStorage.getItem('lastOrderShipping')
      if (raw) setShippingFallback(JSON.parse(raw))
    } catch {}
    // Fetch real order data from the API
    fetchOrderData(orderNumber)
  }, [orderNumber, router])

  const fetchOrderData = async (orderNumber: string) => {
    try {
      setLoading(true)
      
      // For order success page, we'll use a public endpoint
      // that doesn't require authentication but requires order number
      const response = await fetch(`/api/orders/public/${orderNumber}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Porosia nuk u gjet')
        } else {
          setError('Gabim në ngarkimin e porosisë')
        }
        return
      }

      const data = await response.json()
      setOrder(data.order)
      
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Gabim në ngarkimin e porosisë')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Duke ngarkuar...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Gabim</h1>
          <p className="text-gray-600 mb-6">{error || 'Porosia nuk u gjet'}</p>
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 inline-block"
          >
            Kthehu në dyqan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              Porosia u krye me sukses!
            </h1>
            <p className="text-gray-600 mb-6">
              Faleminderit për porosinë tuaj. Do t&apos;ju kontaktojmë së shpejti për konfirmim.
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Numri i porosisë
              </h2>
              <p className="text-2xl font-bold text-purple-600">
                #{order.orderNumber}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Mbajeni këtë numër për të ndjekur porosinë
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Detajet e porosisë</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Informacionet e dërgesës:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Emri:</strong> {order.shippingName || shippingFallback?.name || '-'}</p>
                  <p><strong>Email:</strong> {order.shippingEmail || shippingFallback?.email || '-'}</p>
                  <p><strong>Telefoni:</strong> {order.shippingPhone || shippingFallback?.phone || '-'}</p>
                  <p><strong>Adresa:</strong> {order.shippingAddress || shippingFallback?.address || '-'}</p>
                  <p><strong>Qyteti:</strong> {(order.shippingCity || shippingFallback?.city || '-') + ' ' + (order.shippingZip || shippingFallback?.zip || '')}</p>
                  <p><strong>Shteti:</strong> {order.shippingCountry || shippingFallback?.country || '-'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Informacionet e pagesës:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Metoda:</strong> Kundërpagesë</p>
                  {order.subtotal && (
                    <p><strong>Nëntotali:</strong> {order.subtotal.toFixed(2)} {order.currency}</p>
                  )}
                  {order.shipping && order.shipping > 0 && (
                    <p><strong>Dërgesa:</strong> {order.shipping.toFixed(2)} {order.currency}</p>
                  )}
                  {order.tax && order.tax > 0 && (
                    <p><strong>Taksa:</strong> {order.tax.toFixed(2)} {order.currency}</p>
                  )}
                  <p><strong>Totali:</strong> <span className="text-lg font-bold text-green-600">{order.total.toFixed(2)} {order.currency}</span></p>
                  <p><strong>Statusi i Porosisë:</strong> 
                    <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      {order.status === 'PENDING' ? 'Në pritje të konfirmimit' : order.status}
                    </span>
                  </p>
                  {order.paymentStatus && (
                    <p><strong>Statusi i Pagesës:</strong> 
                      <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {order.paymentStatus === 'PENDING' ? 'Në pritje' : order.paymentStatus}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.orderItems && order.orderItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Produktet e porosisë</h2>
              
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    {item.product.image && (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Sasia: {item.quantity} × {item.price.toFixed(2)} {order.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{item.total.toFixed(2)} {order.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Hapat e ardhshëm</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Konfirmimi i porosisë</h3>
                  <p className="text-gray-600 text-sm">Do t&apos;ju kontaktojmë brenda 1-2 orëve për të konfirmuar porosinë</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Përgatitja e porosisë</h3>
                  <p className="text-gray-600 text-sm">Produktet do të përgatiten dhe amballazohen me kujdes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Dërgesa</h3>
                  <p className="text-gray-600 text-sm">Porosia do të dërgohet brenda 24-48 orëve</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-4 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 text-center font-semibold"
            >
              Vazhdoni me blerje
            </Link>
            
            <Link
              href="/contact"
              className="flex-1 border-2 border-purple-500 text-purple-500 py-4 rounded-xl hover:bg-purple-50 transition-colors text-center font-semibold"
            >
              Kontaktoni
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="text-center mt-8 p-6 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Keni pyetje?</h3>
            <p className="text-gray-600 mb-4">Kontaktoni me ne për çdo gjë që ju nevojitet</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="tel:+38344123456" className="text-purple-600 hover:text-purple-800">
                📞 +383 44 123 456
              </a>
              <a href="mailto:info@proudshop.com" className="text-purple-600 hover:text-purple-800">
                ✉️ info@proudshop.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
