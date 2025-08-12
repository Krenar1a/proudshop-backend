'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Save, Upload, Image, Video, Sparkles, Loader2, X, Plus, 
  FileText, Zap, Camera, Film, Monitor, Package, Tag, DollarSign,
  BarChart3, Info, Star, Globe, Calendar, Truck
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
}

interface MediaFile {
  id: string
  url: string
  type: 'image' | 'video'
  name: string
  size?: number
  preview?: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [aiGenerating, setAiGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    sku: '',
    stockQuantity: '',
    brand: '',
    weight: '',
    dimensions: '',
    tags: '',
    specifications: '',
    shortDesc: '',
    status: 'active',
    featured: false,
    salePrice: '',
    saleStartDate: '',
    saleEndDate: '',
    shippingClass: 'standard',
    metaTitle: '',
    metaDescription: '',
    warranty: '',
    returnPolicy: '30',
    minimumQuantity: '1',
    maximumQuantity: '999',
    colors: '',
    sizes: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (type === 'image' && !file.type.startsWith('image/')) {
        toast.error('Ju lutem zgjidhni vetëm foto')
        return
      }
      if (type === 'video' && !file.type.startsWith('video/')) {
        toast.error('Ju lutem zgjidhni vetëm video')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const newMedia: MediaFile = {
          id: Date.now().toString() + Math.random(),
          url: e.target?.result as string,
          type,
          name: file.name,
          size: file.size,
          preview: type === 'image' ? e.target?.result as string : undefined
        }
        setMediaFiles(prev => [...prev, newMedia])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (event.target) event.target.value = ''
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      const type: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 
                                     file.type.startsWith('video/') ? 'video' : 'image'
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const newMedia: MediaFile = {
          id: Date.now().toString() + Math.random(),
          url: event.target?.result as string,
          type,
          name: file.name,
          size: file.size,
          preview: type === 'image' ? event.target?.result as string : undefined
        }
        setMediaFiles(prev => [...prev, newMedia])
      }
      reader.readAsDataURL(file)
    })
  }

  const addMediaUrl = () => {
    const url = prompt('Shkruani URL-në e imazhit ose videos:')
    const type = prompt('Zgjidhni llojin (image/video):') as 'image' | 'video'
    if (url && (type === 'image' || type === 'video')) {
      const newMedia: MediaFile = {
        id: Date.now().toString(),
        url,
        type,
        name: `Media ${mediaFiles.length + 1}`
      }
      setMediaFiles(prev => [...prev, newMedia])
    }
  }

  const generateSKU = () => {
    const prefix = formData.brand ? formData.brand.substring(0, 3).toUpperCase() : 'PRD'
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const sku = `${prefix}-${random}`
    setFormData(prev => ({ ...prev, sku }))
  }

  const formatPrice = (value: string) => {
    return value.replace(/[^\d.]/g, '')
  }

  const generateAIContent = async () => {
    if (!formData.name) {
      toast.error('Shkruani emrin e produktit para se të përdorni AI')
      return
    }

    setAiGenerating(true)
    try {
      const response = await fetch('/api/admin/ai/generate-product-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          productName: formData.name,
          category: categories.find(c => c.id === formData.categoryId)?.name || '',
          brand: formData.brand
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          description: data.description || prev.description,
          shortDesc: data.shortDescription || prev.shortDesc,
          tags: data.tags ? data.tags.join(', ') : prev.tags,
          specifications: data.specifications || prev.specifications
        }))
        toast.success('Përmbajtja u gjenerua me sukses!')
      } else {
        toast.error('Gabim në gjenerimin e përmbajtjes')
      }
    } catch (error) {
      console.error('Error generating AI content:', error)
      toast.error('Gabim në gjenerimin e përmbajtjes')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Emri i produktit është i detyrueshëm')
      return
    }
    
    if (!formData.price) {
      toast.error('Çmimi është i detyrueshëm')
      return
    }
    
    if (!formData.categoryId) {
      toast.error('Kategoria është e detyrueshme')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          minimumQuantity: parseInt(formData.minimumQuantity) || 1,
          maximumQuantity: parseInt(formData.maximumQuantity) || 999,
          returnPolicy: parseInt(formData.returnPolicy) || 30,
          images: JSON.stringify(mediaFiles.map(m => ({ 
            url: m.url, 
            type: m.type, 
            name: m.name,
            size: m.size 
          }))),
          tags: JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)),
          colors: formData.colors ? JSON.stringify(formData.colors.split(',').map(c => c.trim()).filter(Boolean)) : null,
          sizes: formData.sizes ? JSON.stringify(formData.sizes.split(',').map(s => s.trim()).filter(Boolean)) : null,
          featured: formData.featured
        })
      })

      if (response.ok) {
        toast.success('Produkti u krijua me sukses!')
        router.push('/admin/products')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gabim në krijimin e produktit')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Gabim në krijimin e produktit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/products')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shto Produkt të Ri</h1>
                <p className="text-sm text-gray-600">Krijoni një produkt të ri për dyqanin tuaj</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anulo
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Save size={20} />
                <span>{loading ? 'Po ruhet...' : 'Ruaj Produktin'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', label: 'Informacione Bazike', icon: Package },
                { id: 'media', label: 'Foto & Video', icon: Camera },
                { id: 'details', label: 'Detaje të Tjera', icon: Info },
                { id: 'seo', label: 'SEO & Marketing', icon: Globe }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Product Name & Category */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Package className="mr-2" size={20} />
                  Informacione Bazike
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emri i Produktit *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Shkruani emrin e produktit..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategoria *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Zgjidh kategorinë</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brandi
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Emri i brendit..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statusi
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Aktiv</option>
                      <option value="draft">Draft</option>
                      <option value="inactive">Joaktiv</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">Produkt i rekomanduar</span>
                      <Star className="h-4 w-4 text-yellow-400" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <DollarSign className="mr-2" size={20} />
                  Çmimet & Inventari
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Çmimi Bazik (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: formatPrice(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Çmimi me Zbritje (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({...formData, salePrice: formatPrice(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="SKU-001"
                      />
                      <button
                        type="button"
                        onClick={generateSKU}
                        className="px-3 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
                        title="Gjeneroni SKU automatikisht"
                      >
                        <Zap size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sasia në Stok *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sasia Minimale
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.minimumQuantity}
                      onChange={(e) => setFormData({...formData, minimumQuantity: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sasia Maksimale
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maximumQuantity}
                      onChange={(e) => setFormData({...formData, maximumQuantity: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="999"
                    />
                  </div>
                </div>

                {/* Sale Period */}
                {formData.salePrice && (
                  <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-800 mb-3">Periudha e Zbritjes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">
                          Data e Fillimit
                        </label>
                        <input
                          type="date"
                          value={formData.saleStartDate}
                          onChange={(e) => setFormData({...formData, saleStartDate: e.target.value})}
                          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">
                          Data e Përfundimit
                        </label>
                        <input
                          type="date"
                          value={formData.saleEndDate}
                          onChange={(e) => setFormData({...formData, saleEndDate: e.target.value})}
                          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="mr-2" size={20} />
                    Përshkrimi i Produktit
                  </h3>
                  <button
                    type="button"
                    onClick={generateAIContent}
                    disabled={aiGenerating || !formData.name}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Duke gjeneruar...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Gjeneroni me AI</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Përshkrimi i Shkurtër
                    </label>
                    <textarea
                      value={formData.shortDesc}
                      onChange={(e) => setFormData({...formData, shortDesc: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Përshkrim i shkurtër për listimin e produktit..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Përshkrimi i Plotë *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Përshkrim i detajuar i produktit, karakteristikat, përfitimet..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (të ndara me presje)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="elektronik, telefon, smartphone, android"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Upload Tab */}
          {activeTab === 'media' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <Camera className="mr-2" size={20} />
                Foto & Video
              </h3>
              
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Zvarritni foto dhe video këtu
                    </p>
                    <p className="text-sm text-gray-500">
                      ose klikoni për të zgjedhur nga kompjuteri
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                    >
                      <Image size={18} />
                      <span>Zgjidh Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-colors"
                    >
                      <Video size={18} />
                      <span>Zgjidh Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={addMediaUrl}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                    >
                      <Plus size={18} />
                      <span>Shto URL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'image')}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'video')}
              />

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Media e Ngarkuar ({mediaFiles.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {mediaFiles.map((media, index) => (
                      <div key={media.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={media.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                              <Video className="h-8 w-8 text-white z-10" />
                              <video
                                src={media.url}
                                className="absolute inset-0 w-full h-full object-cover opacity-30"
                                muted
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Media Info */}
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {media.type}
                        </div>
                        
                        {/* Size Info */}
                        {media.size && (
                          <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {(media.size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        )}
                        
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                        
                        {/* Name */}
                        <p className="mt-2 text-xs text-gray-600 truncate" title={media.name}>
                          {media.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Physical Properties */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Package className="mr-2" size={20} />
                  Karakteristikat Fizike
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pesha (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensionet (LxGxH)
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="20cm x 30cm x 10cm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klasa e Transportit
                    </label>
                    <select
                      value={formData.shippingClass}
                      onChange={(e) => setFormData({...formData, shippingClass: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                      <option value="heavy">I rëndë</option>
                      <option value="fragile">I thyeshëm</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Tag className="mr-2" size={20} />
                  Variantet
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngjyrat (të ndara me presje)
                    </label>
                    <input
                      type="text"
                      value={formData.colors}
                      onChange={(e) => setFormData({...formData, colors: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e zezë, e bardhë, blu, e kuqe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Madhësitë (të ndara me presje)
                    </label>
                    <input
                      type="text"
                      value={formData.sizes}
                      onChange={(e) => setFormData({...formData, sizes: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="S, M, L, XL, XXL"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Monitor className="mr-2" size={20} />
                  Specifikacione Teknike
                </h3>
                
                <div>
                  <textarea
                    value={formData.specifications}
                    onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Specifikacione teknike, karakteristika, përfitimet, etj..."
                  />
                </div>
              </div>

              {/* Warranty & Returns */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Truck className="mr-2" size={20} />
                  Garancia & Kthimi
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Garancia
                    </label>
                    <input
                      type="text"
                      value={formData.warranty}
                      onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12 muaj, 2 vjet, etj."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periudha e Kthimit (ditë)
                    </label>
                    <select
                      value={formData.returnPolicy}
                      onChange={(e) => setFormData({...formData, returnPolicy: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="7">7 ditë</option>
                      <option value="14">14 ditë</option>
                      <option value="30">30 ditë</option>
                      <option value="60">60 ditë</option>
                      <option value="90">90 ditë</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Globe className="mr-2" size={20} />
                  SEO & Marketing
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Titulli për motorët e kërkimit"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.metaTitle.length}/60 karaktere
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Përshkrimi për motorët e kërkimit"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.metaDescription.length}/160 karaktere
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
