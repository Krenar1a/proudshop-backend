'use client'

import { useState, useEffect } from 'react'
import { Mail, Users, Sparkles, Target, Send, Plus, Filter, Download, Settings } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Customer {
  email: string
  name: string
  country: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string
  segment: string
}

interface Product {
  id: string
  name: string
  price: number
  description?: string
}

export default function AdvancedEmailMarketingPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [customerFilter, setCustomerFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('campaigns')
  
  // AI Email Generator states
  const [emailType, setEmailType] = useState('product_offer')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [offerDetails, setOfferDetails] = useState({
    discount: 20,
    expiry: '',
    timeLimit: 24,
    quantity: 10
  })
  const [generatedEmail, setGeneratedEmail] = useState<{subject: string, content: string} | null>(null)
  const [newsletterTheme, setNewsletterTheme] = useState('weekly')

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  const fetchCustomers = async (filter = 'all') => {
    try {
      const response = await fetch(`/api/admin/customers?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const raw = Array.isArray(data?.products) ? data.products : []
        // Normalize various backend field names -> Product interface
        const normalized: Product[] = raw.map((p: any) => ({
          id: String(p?.id ?? ''),
          name: String(p?.name ?? p?.title ?? p?.productName ?? 'Produkt'),
          price: Number(p?.price ?? p?.price_eur ?? p?.priceEur ?? 0) || 0,
          description: String(p?.description ?? p?.shortDesc ?? '') || undefined,
        }))
        setProducts(normalized)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const generateAIEmail = async () => {
    if (emailType === 'product_offer' && !selectedProduct) {
      toast.error('Zgjidhni një produkt')
      return
    }

    setLoading(true)
    try {
      let requestData
      
      if (emailType === 'product_offer') {
        const product = products.find(p => String(p.id) === String(selectedProduct))
        if (!product || !product.name) {
          toast.error('Produkt i pavlefshëm')
          setLoading(false)
          return
        }
        const safeOffer = {
          discount: Number(offerDetails.discount) || 0,
          expiry: offerDetails.expiry || undefined,
          timeLimit: Number(offerDetails.timeLimit) || undefined,
          quantity: Number(offerDetails.quantity) || undefined,
        }
        requestData = {
          type: 'product_offer',
          data: {
            productData: {
              id: product.id,
              name: product.name,
              price: product.price,
              description: product.description
            },
            offerDetails: safeOffer
          }
        }
      } else {
        requestData = {
          type: 'newsletter',
          data: {
            products: products.slice(0, 12).map(p => ({ id: p.id, name: p.name, price: p.price, description: p.description })),
            theme: newsletterTheme
          }
        }
      }

      const response = await fetch('/api/admin/ai/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedEmail(data.email)
        toast.success('AI email u gjenerua me sukses!')
      } else {
        toast.error(data.error || 'Gabim në gjenerimin e email')
      }
    } catch (error) {
      toast.error('Gabim në gjenerimin e email')
    } finally {
      setLoading(false)
    }
  }

  const sendEmailCampaign = async () => {
    if (!generatedEmail) {
      toast.error('Gjeneroni email-in fillimisht')
      return
    }

    if (selectedCustomers.length === 0) {
      toast.error('Zgjidhni të paktën një klient')
      return
    }

    setLoading(true)
    try {
      const recipients = selectedCustomers.map(email => 
        customers.find(c => c.email === email)?.email
      ).filter(Boolean)

  const response = await fetch('/api/admin/marketing/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          campaignName: `AI Generated - ${emailType}`,
          subject: generatedEmail.subject,
          content: generatedEmail.content,
          recipients
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setSelectedCustomers([])
        setGeneratedEmail(null)
      } else {
        toast.error(data.error || 'Gabim në dërgimin e kampanjës')
      }
    } catch (error) {
      toast.error('Gabim në dërgimin e kampanjës')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerSelect = (email: string) => {
    setSelectedCustomers(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map(c => c.email))
    }
  }

  const handleFilterChange = (filter: string) => {
    setCustomerFilter(filter)
    fetchCustomers(filter)
    setSelectedCustomers([])
  }

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-800'
      case 'High Value': return 'bg-blue-100 text-blue-800'
      case 'Frequent': return 'bg-green-100 text-green-800'
      case 'Active': return 'bg-yellow-100 text-yellow-800'
      case 'New': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Email Marketing</h1>
          <p className="text-gray-600">Gjeneroni dhe dërgoni email campaigns të personalizuara me AI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Sparkles size={16} className="inline mr-2" />
            AI Email Generator
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Customer Targeting
          </button>
        </nav>
      </div>

      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Email Generator */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="mr-2 text-blue-500" size={20} />
              AI Email Generator
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lloji i email-it
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="product_offer">Ofertë produkti</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>

              {emailType === 'product_offer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Produkti
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Zgjidhni produktin</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - €{product.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zbritja (%)
                      </label>
                      <input
                        type="number"
                        value={offerDetails.discount}
                        onChange={(e) => setOfferDetails({...offerDetails, discount: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="5"
                        max="70"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kohëzgjatja (orë)
                      </label>
                      <input
                        type="number"
                        value={offerDetails.timeLimit}
                        onChange={(e) => setOfferDetails({...offerDetails, timeLimit: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="168"
                      />
                    </div>
                  </div>
                </>
              )}

              {emailType === 'newsletter' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema e newsletter-it
                  </label>
                  <select
                    value={newsletterTheme}
                    onChange={(e) => setNewsletterTheme(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Newsletter Javor</option>
                    <option value="seasonal">Koleksioni i Ri</option>
                    <option value="trending">Produktet Trending</option>
                  </select>
                </div>
              )}

              <button
                onClick={generateAIEmail}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Duke gjeneruar...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Gjeneroni me AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Email Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Mail className="mr-2 text-green-500" size={20} />
              Email Preview
            </h3>

            {generatedEmail ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <div className="p-3 bg-gray-50 rounded border text-sm">
                    {generatedEmail.subject}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Preview
                  </label>
                  <div className="p-4 bg-gray-50 rounded border max-h-60 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: generatedEmail.content }} />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={sendEmailCampaign}
                    disabled={loading || selectedCustomers.length === 0}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Send size={16} />
                    <span>Dërgo ({selectedCustomers.length} klientë)</span>
                  </button>
                  <button
                    onClick={() => setGeneratedEmail(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Rikr
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Mail size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Gjeneroni një email për ta parë preview-n</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Customer Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="mr-2 text-blue-500" size={20} />
              Customer Targeting
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { value: 'all', label: 'Të gjithë', icon: Users },
                { value: 'active', label: 'Aktivë', icon: Target },
                { value: 'frequent', label: 'Të shpeshtë', icon: Users },
                { value: 'high_value', label: 'High Value', icon: Users },
                { value: 'new', label: 'Të rinj', icon: Plus }
              ].map((filter) => {
                const Icon = filter.icon
                return (
                  <button
                    key={filter.value}
                    onClick={() => handleFilterChange(filter.value)}
                    className={`p-3 rounded-lg border text-center ${
                      customerFilter === filter.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} className="mx-auto mb-1" />
                    <div className="text-sm font-medium">{filter.label}</div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectedCustomers.length === customers.length ? 'Çzgjidh të gjithë' : 'Zgjidh të gjithë'}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedCustomers.length} nga {customers.length} të zgjidhur
                </span>
              </div>
            </div>
          </div>

          {/* Customer List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.length === customers.length && customers.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klienti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Segmenti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Porositë
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Totali
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Porosia e fundit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.email)}
                          onChange={() => handleCustomerSelect(customer.email)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          <div className="text-xs text-gray-400">{customer.country}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSegmentColor(customer.segment)}`}>
                          {customer.segment}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.orderCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{customer.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('sq-AL') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {customers.length === 0 && (
              <div className="p-12 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nuk u gjetën klientë për këtë filtër</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
